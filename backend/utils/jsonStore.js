const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const configuredStorePath = process.env.STORE_FILE_PATH || "";
const defaultDataDir = path.join(__dirname, "..", "data");
const filePath = configuredStorePath
  ? path.resolve(configuredStorePath)
  : path.join(defaultDataDir, "submissions.json");
const dataDir = path.dirname(filePath);

const defaultPayload = {
  submissions: [],
  messages: [],
  admins: [],
};

let writeQueue = Promise.resolve();

function withWriteLock(operation) {
  writeQueue = writeQueue.then(operation, operation);
  return writeQueue;
}

function ensureStoreShape(parsed) {
  const submissions = Array.isArray(parsed.submissions) ? parsed.submissions : [];
  const rawMessages = Array.isArray(parsed.messages) ? parsed.messages : [];
  const sourceMessages = rawMessages.length > 0
    ? rawMessages
    : submissions
        .filter((item) => item && item.profileId)
        .map((item) => ({
          _id: String(item.profileId),
          email: item.email || "",
          fullName: item.fullName || "",
          age: Number.isInteger(Number(item.age)) ? Number(item.age) : null,
          profileImage: item.profileImage || "",
          anonymousName: item.anonymousName || "",
          message: item.message || "",
          createdAt: item.profileCreatedAt || new Date().toISOString(),
          updatedAt: item.messageCreatedAt || item.profileCreatedAt || new Date().toISOString(),
        }));

  const normalizedMessages = sourceMessages.map((item) => {
    const resolvedId = String(item._id || item.profileId || item.id || generateId());
    return {
      ...item,
      _id: resolvedId,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
    };
  });

  return {
    submissions,
    messages: normalizedMessages,
    admins: Array.isArray(parsed.admins) ? parsed.admins : [],
  };
}

function generateId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString("hex");
}

async function ensureStoreFile() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(filePath);
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = raw ? JSON.parse(raw) : {};
    const normalized = ensureStoreShape(parsed);
    if (JSON.stringify(parsed) !== JSON.stringify(normalized)) {
      await fs.writeFile(filePath, JSON.stringify(normalized, null, 2), "utf8");
    }
  } catch (_error) {
    await fs.writeFile(filePath, JSON.stringify(defaultPayload, null, 2), "utf8");
  }
}

async function readStore() {
  await ensureStoreFile();
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = raw ? JSON.parse(raw) : {};
  return ensureStoreShape(parsed);
}

async function writeStore(payload) {
  await fs.writeFile(filePath, JSON.stringify(ensureStoreShape(payload), null, 2), "utf8");
}

async function createProfile(profile) {
  return withWriteLock(async () => {
    const store = await readStore();
    const now = new Date().toISOString();
    const created = {
      _id: generateId(),
      email: profile.email,
      fullName: profile.fullName,
      age: profile.age,
      profileImage: profile.profileImage,
      anonymousName: "",
      message: "",
      createdAt: now,
      updatedAt: now,
    };

    store.messages.push(created);
    store.submissions.push({
      profileId: created._id,
      email: created.email,
      fullName: created.fullName,
      age: created.age,
      profileImage: created.profileImage,
      anonymousName: "",
      message: "",
      profileCreatedAt: created.createdAt,
      messageCreatedAt: null,
    });

    await writeStore(store);
    return created;
  });
}

async function updateMessageByProfileId(profileId, payload) {
  return withWriteLock(async () => {
    const store = await readStore();
    const index = store.messages.findIndex((item) => item._id === profileId);
    if (index < 0) {
      return null;
    }

    const updated = {
      ...store.messages[index],
      anonymousName: payload.anonymousName,
      message: payload.message,
      updatedAt: new Date().toISOString(),
    };
    store.messages[index] = updated;

    const submission = store.submissions.find((item) => item.profileId === profileId);
    if (submission) {
      submission.anonymousName = updated.anonymousName;
      submission.message = updated.message;
      submission.messageCreatedAt = updated.updatedAt;
    } else {
      store.submissions.push({
        profileId: updated._id,
        email: updated.email || "",
        fullName: updated.fullName || "",
        age: updated.age || null,
        profileImage: updated.profileImage || "",
        anonymousName: updated.anonymousName,
        message: updated.message,
        profileCreatedAt: updated.createdAt || null,
        messageCreatedAt: updated.updatedAt || null,
      });
    }

    await writeStore(store);
    return updated;
  });
}

async function listSubmittedMessages() {
  const store = await readStore();
  return [...store.messages]
    .filter((item) => typeof item.message === "string" && item.message.trim() !== "")
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
}

async function deleteMessageById(id) {
  return withWriteLock(async () => {
    const store = await readStore();
    const normalizedId = String(id);
    const index = store.messages.findIndex(
      (item) =>
        String(item._id || "") === normalizedId ||
        String(item.profileId || "") === normalizedId ||
        String(item.id || "") === normalizedId
    );
    if (index < 0) {
      return null;
    }

    const [deleted] = store.messages.splice(index, 1);
    const submissionIdCandidates = new Set([
      normalizedId,
      String(deleted._id || ""),
      String(deleted.profileId || ""),
      String(deleted.id || ""),
    ]);
    store.submissions = store.submissions.filter(
      (item) => !submissionIdCandidates.has(String(item.profileId || ""))
    );

    await writeStore(store);
    return deleted;
  });
}

async function findAdminByEmail(email) {
  const store = await readStore();
  return store.admins.find((item) => item.email === email) || null;
}

async function upsertAdmin(email, passwordHash) {
  return withWriteLock(async () => {
    const store = await readStore();
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const now = new Date().toISOString();
    const index = store.admins.findIndex((item) => item.email === normalizedEmail);

    if (index >= 0) {
      store.admins[index] = {
        ...store.admins[index],
        email: normalizedEmail,
        passwordHash,
        updatedAt: now,
      };
      await writeStore(store);
      return store.admins[index];
    }

    const created = {
      _id: generateId(),
      email: normalizedEmail,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };
    store.admins.push(created);
    await writeStore(store);
    return created;
  });
}

module.exports = {
  ensureStoreFile,
  createProfile,
  updateMessageByProfileId,
  listSubmittedMessages,
  deleteMessageById,
  findAdminByEmail,
  upsertAdmin,
};

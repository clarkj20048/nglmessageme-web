const bcrypt = require("bcryptjs");
const validator = require("validator");

const { upsertAdmin } = require("./jsonStore");

async function ensureAdminSeed() {
  const email = String(process.env.ADMIN_EMAIL || "").trim();
  const password = String(process.env.ADMIN_PASSWORD || "").trim();

  if (!email || !password) {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set; admin seed skipped.");
    return;
  }

  if (!validator.isEmail(email)) {
    console.warn("ADMIN_EMAIL is not a valid email address; admin seed skipped.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await upsertAdmin(email, passwordHash);
  console.log(`Admin credentials ensured for ${email}.`);
}

module.exports = ensureAdminSeed;

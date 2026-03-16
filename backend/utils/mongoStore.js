const Message = require("../models/Message");
const Profile = require("../models/Profile");
const Admin = require("../models/Admin");

async function createProfile(profileData) {
  const profile = new Profile(profileData);
  await profile.save();
  return profile;
}

async function updateMessageByProfileId(profileId, payload) {
  // First try to find existing message
  let message = await Message.findOne({ profileId });

  if (message) {
    // Update existing message
    message.anonymousName = payload.anonymousName;
    message.message = payload.message;
    await message.save();
    return message;
  } else {
    // Create new message
    message = new Message({
      profileId,
      anonymousName: payload.anonymousName,
      message: payload.message,
    });
    await message.save();
    return message;
  }
}

async function listSubmittedMessages() {
  const messages = await Message.find({
    message: { $exists: true, $ne: "" },
  }).sort({ createdAt: -1 });
  return messages;
}

async function deleteMessageById(id) {
  const message = await Message.findByIdAndDelete(id);
  return message;
}

async function findAdminByEmail(email) {
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  return admin;
}

async function upsertAdmin(email, passwordHash) {
  const normalizedEmail = email.toLowerCase().trim();
  const admin = await Admin.findOneAndUpdate(
    { email: normalizedEmail },
    { email: normalizedEmail, passwordHash },
    { upsert: true, new: true }
  );
  return admin;
}

async function findProfileById(profileId) {
  const profile = await Profile.findById(profileId);
  return profile;
}

module.exports = {
  createProfile,
  updateMessageByProfileId,
  listSubmittedMessages,
  deleteMessageById,
  findAdminByEmail,
  upsertAdmin,
  findProfileById,
};


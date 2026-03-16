const bcrypt = require("bcryptjs");
const { getAdminSeedConfig } = require("./adminConfig");
const { upsertAdmin } = require("./jsonStore");

async function ensureAdminSeed() {
  const { email, password, isValid, reason } = getAdminSeedConfig();

  if (!isValid) {
    if (reason === "missing") {
      console.warn("ADMIN_EMAIL/ADMIN_PASSWORD not set; admin seed skipped.");
    } else if (reason === "invalid_email") {
      console.warn("ADMIN_EMAIL is not a valid email address; admin seed skipped.");
    } else {
      console.warn("Admin seed configuration invalid; admin seed skipped.");
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await upsertAdmin(email, passwordHash);
  console.log(`Admin credentials ensured for ${email}.`);
}

module.exports = ensureAdminSeed;

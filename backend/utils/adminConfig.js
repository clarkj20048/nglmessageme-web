const validator = require("validator");

function getAdminSeedConfig() {
  const rawEmail = String(
    process.env.ADMIN_EMAIL || process.env.RENDER_ADMIN_EMAIL || ""
  ).trim();
  const rawPassword = String(
    process.env.ADMIN_PASSWORD || process.env.RENDER_ADMIN_PASSWORD || ""
  ).trim();

  if (!rawEmail || !rawPassword) {
    return {
      email: rawEmail.toLowerCase(),
      password: rawPassword,
      isValid: false,
      reason: "missing",
    };
  }

  if (!validator.isEmail(rawEmail)) {
    return {
      email: rawEmail.toLowerCase(),
      password: rawPassword,
      isValid: false,
      reason: "invalid_email",
    };
  }

  return {
    email: rawEmail.toLowerCase(),
    password: rawPassword,
    isValid: true,
    reason: "ok",
  };
}

module.exports = {
  getAdminSeedConfig,
};

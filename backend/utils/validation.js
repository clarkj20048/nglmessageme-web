const validator = require("validator");

const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function sanitizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  // Escapes HTML and trims to reduce injection risk.
  return validator.escape(value).trim();
}

function hasAtLeastTwoWords(fullName) {
  const words = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words.length >= 2;
}

function validateMessagePayload(payload) {
  const profileId = sanitizeText(payload.profileId);
  const anonymousName = sanitizeText(payload.anonymousName);
  const message = sanitizeText(payload.message);

  const errors = {};

  if (!profileId) {
    errors.profileId = "Profile id is required.";
  }

  if (!anonymousName) {
    errors.anonymousName = "Anonymous display name is required.";
  }

  if (!message) {
    errors.message = "Message is required.";
  }

  return {
    sanitized: {
      profileId,
      anonymousName,
      message,
    },
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

function validateProfilePayload(payload) {
  const email = sanitizeText(payload.email).toLowerCase();
  const fullName = sanitizeText(payload.fullName);
  const profileImage = String(payload.profileImage || "").trim();
  const ageNumber = Number(payload.age);
  const imageMimeMatch = profileImage.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  const imageMimeType = imageMimeMatch ? imageMimeMatch[1].toLowerCase() : "";

  const errors = {};

  if (!email) {
    errors.email = "Email is required.";
  } else if (!validator.isEmail(email)) {
    errors.email = "Email must be valid.";
  }

  if (!fullName) {
    errors.fullName = "Full name is required.";
  } else if (!hasAtLeastTwoWords(fullName)) {
    errors.fullName = "Full name must include at least first name and last name.";
  }

  if (!Number.isInteger(ageNumber) || ageNumber < 1 || ageNumber > 120) {
    errors.age = "Age must be a valid number between 1 and 120.";
  }

  if (!profileImage || !imageMimeType || !ALLOWED_IMAGE_MIME_TYPES.includes(imageMimeType)) {
    errors.profileImage = "A valid image file is required (JPG, PNG, WEBP, GIF).";
  }

  return {
    sanitized: {
      email,
      fullName,
      age: ageNumber,
      profileImage,
    },
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

module.exports = {
  sanitizeText,
  validateMessagePayload,
  validateProfilePayload,
};

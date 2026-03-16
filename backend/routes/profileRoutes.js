const express = require("express");

const { validateProfilePayload } = require("../utils/validation");
const { createProfile } = require("../utils/jsonStore");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { sanitized, errors, isValid } = validateProfilePayload(req.body);

    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const profile = await createProfile(sanitized);

    return res.status(201).json({
      message: "Profile created successfully.",
      data: {
        id: profile._id,
        email: profile.email,
        fullName: profile.fullName,
        age: profile.age,
      },
    });
  } catch (error) {
    console.error("Error in profileRoutes:", error);
    return res.status(500).json({ message: "Failed to create profile." });
  }
});

module.exports = router;

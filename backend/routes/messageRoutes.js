const express = require("express");
const { validateMessagePayload } = require("../utils/validation");
const { updateMessageByProfileId } = require("../utils/jsonStore");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { sanitized, errors, isValid } = validateMessagePayload(req.body);

    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const saved = await updateMessageByProfileId(sanitized.profileId, {
      anonymousName: sanitized.anonymousName,
      message: sanitized.message,
    });

    if (!saved) {
      return res.status(404).json({ message: "Profile not found." });
    }
    return res.status(200).json({
      message: "Message submitted successfully.",
      data: {
        id: saved._id,
        anonymousName: saved.anonymousName,
        message: saved.message,
        createdAt: saved.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in messageRoutes:", error);
    return res.status(500).json({ message: "Failed to save message" });
  }
});

module.exports = router;

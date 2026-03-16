const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { requireAdminAuth } = require("../middleware/authMiddleware");
const { sanitizeText } = require("../utils/validation");
const { getAdminSeedConfig } = require("../utils/adminConfig");
const {
  findAdminByEmail,
  listSubmittedMessages,
  deleteMessageById,
  upsertAdmin,
} = require("../utils/jsonStore");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const email = sanitizeText(req.body.email).toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ message: "Server misconfigured: JWT secret missing." });
    }

    let admin = await findAdminByEmail(email);
    const seedConfig = getAdminSeedConfig();

    if (!admin) {
      const canSeed =
        seedConfig.isValid && email === seedConfig.email && password === seedConfig.password;

      if (!canSeed) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const passwordHash = await bcrypt.hash(seedConfig.password, 12);
      admin = await upsertAdmin(seedConfig.email, passwordHash);
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      const canReset =
        seedConfig.isValid && email === seedConfig.email && password === seedConfig.password;

      if (!canReset) {
        return res.status(401).json({ message: "Invalid credentials." });
      }

      const passwordHash = await bcrypt.hash(seedConfig.password, 12);
      admin = await upsertAdmin(seedConfig.email, passwordHash);
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
      },
      jwtSecret,
      { expiresIn: "8h" }
    );

    return res.json({ token });
  } catch (error) {
    console.error("Error in admin login:", error);
    return res.status(500).json({ message: "Login failed." });
  }
});

router.get("/messages", requireAdminAuth, async (_req, res) => {
  try {
    const messages = await listSubmittedMessages();
    return res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Failed to load messages." });
  }
});

router.delete("/messages/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteMessageById(id);

    if (!deleted) {
      return res.status(404).json({ message: "Message not found." });
    }

    return res.json({ message: "Message deleted successfully." });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ message: "Failed to delete message." });
  }
});

module.exports = router;

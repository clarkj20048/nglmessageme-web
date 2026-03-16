const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { requireAdminAuth } = require("../middleware/authMiddleware");
const { sanitizeText } = require("../utils/validation");
const {
  findAdminByEmail,
  listSubmittedMessages,
  deleteMessageById,
} = require("../utils/jsonStore");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const email = sanitizeText(req.body.email).toLowerCase();
    const password = String(req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
        email: admin.email,
      },
      process.env.JWT_SECRET,
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

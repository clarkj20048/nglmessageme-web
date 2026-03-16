const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const messageRoutes = require("./routes/messageRoutes");
const profileRoutes = require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const ensureAdminSeed = require("./utils/ensureAdminSeed");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 5000;

async function startServer() {
  await ensureAdminSeed();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "https://nglmessageme-website.vercel.app",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "6mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.use("/api/messages", messageRoutes);
  app.use("/api/profiles", profileRoutes);
  app.use("/api/admin", adminRoutes);

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

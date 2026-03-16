const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const validator = require("validator");

const { upsertAdmin } = require("../utils/jsonStore");

dotenv.config();

function readSeedInput() {
  const cliEmail = String(process.argv[2] || "").trim();
  const cliPassword = String(process.argv[3] || "").trim();

  const email = cliEmail || String(process.env.ADMIN_EMAIL || "").trim();
  const password = cliPassword || String(process.env.ADMIN_PASSWORD || "").trim();

  return { email, password };
}

async function main() {
  const { email, password } = readSeedInput();

  if (!email || !password) {
    throw new Error(
      "Provide email/password via CLI or .env. Example: npm run seed:admin -- admin@example.com MyStrongPass123!"
    );
  }

  if (!validator.isEmail(email)) {
    throw new Error("Admin email must be a valid email address.");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await upsertAdmin(email, passwordHash);

  console.log("Admin user created/updated successfully.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

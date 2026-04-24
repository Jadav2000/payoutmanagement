const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const ROLES = require("../constants/roles");

dotenv.config();

const seedUsers = [
  { email: "ops@demo.com", password: "ops123", role: ROLES.OPS },
  { email: "finance@demo.com", password: "fin123", role: ROLES.FINANCE },
];

const runSeed = async () => {
  await connectDB();

  for (const userData of seedUsers) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      existing.password = userData.password;
      existing.role = userData.role;
      await existing.save();
    } else {
      await User.create(userData);
    }
  }

  console.log("Seed completed: OPS and FINANCE users are ready.");
  process.exit(0);
};

runSeed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});

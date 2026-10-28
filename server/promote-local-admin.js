require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/user-model");

const usage = "Usage: npm run admin:promote -- --email <registered-email> --confirm";
const args = process.argv.slice(2);
const emailIndex = args.indexOf("--email");
const email = emailIndex >= 0 ? args[emailIndex + 1]?.trim().toLowerCase() : "";
const confirmed = args.includes("--confirm");

const promote = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Configure server/.env first.");
  }

  if (!email || !email.includes("@") || !confirmed) {
    throw new Error(usage);
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existingAdmins = await User.countDocuments({ isAdmin: true });
  if (existingAdmins > 0) {
    throw new Error("An admin account already exists. Use the admin panel to manage roles.");
  }

  const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const user = await User.findOne({
    email: new RegExp(`^${escapedEmail}$`, "i"),
  });
  if (!user) {
    throw new Error("No registered account matches that email. Sign up and verify your account first.");
  }

  user.isAdmin = true;
  await user.save();
  console.log("Local admin access enabled for the registered account. Sign out and sign in again.");
};

promote()
  .catch((error) => {
    console.error(`Admin promotion failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

const mongoose = require("mongoose");
let bcrypt;
try { bcrypt = require("bcrypt"); } catch { bcrypt = require("bcryptjs"); }

async function seedAdmin() {
  const username = process.env.ADMIN_USERNAME || "Admin";
  const password = process.env.ADMIN_PASSWORD || "Admin123";
  const email = process.env.ADMIN_EMAIL || "admin@thinkbotic.com";

  const users = mongoose.connection.collection("users");
  console.log("Seeding database:", mongoose.connection.name);

  const existing = await users.findOne({ username });

  if (existing) {
    if (!existing.isAdmin) {
      await users.updateOne({ username }, { $set: { isAdmin: true } });
      console.log(`Admin seed: "${username}" promoted to admin`);
    }
    return;
  }

  const hash = await bcrypt.hash(password, 12);
  await users.insertOne({
    username,
    email,
    phone: "+910000000000",
    password: hash,
    isAdmin: true,
    firstname: "Admin",
    lastname: "Panel",
    gender: "Other",
    createdAt: new Date(),
    updatedAt: new Date(),
    __v: 0,
  });
  console.log(`Admin seed: created "${username}"`);
}

module.exports = seedAdmin;
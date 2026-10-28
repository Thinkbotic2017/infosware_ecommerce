const mongoose = require("mongoose");
let bcrypt;
try { bcrypt = require("bcrypt"); } catch { bcrypt = require("bcryptjs"); }

(async () => {
  await mongoose.connect("mongodb://localhost:27017/thinkbotic");
  const users = mongoose.connection.collection("users");

  const hash = await bcrypt.hash("Admin123", 12);

  await users.updateOne(
    { username: "Admin" },
    {
      $set: {
        username: "Admin",
        email: "admin@thinkbotic.com",
        phone: "+910000000000",
        password: hash,
        isAdmin: true,
        firstname: "Admin",
        lastname: "Panel",
        gender: "Other",
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date(), __v: 0 },
    },
    { upsert: true }
  );

  console.log("Admin account ready: Admin / Admin123");
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
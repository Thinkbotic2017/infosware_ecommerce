require("dotenv").config();
const mongoose = require("mongoose");

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await mongoose.connection.db
    .collection("users")
    .find({}, { projection: { username: 1, email: 1, isAdmin: 1, role: 1 } })
    .toArray();
  console.log(users);
  await mongoose.disconnect();
})();

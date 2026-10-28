const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    codEnabled: { type: Boolean, default: true },
    codMinAmount: { type: Number, default: 0, min: 0 }, // 0 = no minimum
    codMaxAmount: { type: Number, default: 0, min: 0 }, // 0 = no maximum
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Setting || mongoose.model("Setting", settingSchema);
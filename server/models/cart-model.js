const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductPage", required: true },
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 },
      img: String,
      oldPrice: Number,
      gst: Number,
      description: String,
      imageColor: String,
      addedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
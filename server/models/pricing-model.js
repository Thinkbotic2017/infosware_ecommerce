const mongoose = require("mongoose");

const cartConfigSchema = new mongoose.Schema({
    cartDiscount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    minFreeDeliveryAmount: { type: Number, default: 0 },
    appliedCoupon: { type: String, default: "" },
    availableCoupons: [
        {
            code: { type: String, default: "" },
            discount: { type: Number, default: 0 },
            description: { type: String, default: "" },
            createdAt: { type: Date, default: Date.now },
            validityDays: { type: Number, default: 0 },
            hidden: { type: Boolean, default: false } 
        }
    ],
});

module.exports = mongoose.model("CartConfig", cartConfigSchema);
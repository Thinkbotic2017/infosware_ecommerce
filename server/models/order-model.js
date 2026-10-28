const mongoose = require("mongoose");

const ITEM_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ITEM_STATUSES },
    note: { type: String, default: "" },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "ProductPage" },
  name: String,
  price: Number,
  quantity: Number,
  img: String,
  oldPrice: Number,
  gst: Number,
  description: String,
  imageColor: String,

  status: { type: String, enum: ITEM_STATUSES, default: "PENDING" },

  statusHistory: {
    type: [statusHistorySchema],
    default: () => [{ status: "PENDING", note: "Order placed" }],
  },

  courierName: String,
  trackingId: String,
  estimatedDelivery: Date,

  deliveredAt: Date,
  cancelledAt: Date,
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shippingAddress: { type: Object, required: true },
    billingAddress: { type: Object, required: true },
    items: [itemSchema],
    orderSummary: { type: Object },

    payment: {
      status: { type: String, default: "pending" },
      razorpayPaymentId: String,
      razorpayOrderId: String,
      razorpaySignature: String,
      amount: Number,
      method: String,
      pricingDetails: [{ label: String, value: Number }],
      appliedCoupon: { type: Object, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.index(
  { "payment.razorpayOrderId": 1 },
  {
    unique: true,
    partialFilterExpression: { "payment.razorpayOrderId": { $type: "string" } },
  }
);
orderSchema.index(
  { "payment.razorpayPaymentId": 1 },
  {
    unique: true,
    partialFilterExpression: { "payment.razorpayPaymentId": { $type: "string" } },
  }
);

// A user can have only ONE pending online order at a time
orderSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      "payment.method": "online",
      "payment.status": "pending",
    },
  }
);

orderSchema.virtual("orderStatus").get(function () {
  const items = this.items || [];
  if (items.length === 0) return "PENDING";

  const active = items.filter((i) => i.status !== "CANCELLED");
  if (active.length === 0) return "CANCELLED";
  if (active.every((i) => i.status === "DELIVERED")) return "DELIVERED";

  const rank = (s) => ITEM_STATUSES.indexOf(s);
  return active.reduce((a, b) => (rank(a.status) <= rank(b.status) ? a : b))
    .status;
});

orderSchema.methods.updateItemStatus = function (
  itemId,
  status,
  note = "",
  shipment = {}
) {
  const item = this.items.id(itemId);
  if (!item) throw new Error("Item not found");
  if (!ITEM_STATUSES.includes(status)) throw new Error("Invalid status");

  item.status = status;
  item.statusHistory.push({ status, note });

  if (shipment.courierName) item.courierName = shipment.courierName;
  if (shipment.trackingId) item.trackingId = shipment.trackingId;
  if (shipment.estimatedDelivery)
    item.estimatedDelivery = shipment.estimatedDelivery;
  if (status === "DELIVERED") item.deliveredAt = new Date();
  if (status === "CANCELLED") item.cancelledAt = new Date();

  if (this.payment?.method === "cod" && this.orderStatus === "DELIVERED") {
    this.payment.status = "paid";
  }

  return this.save();
};

orderSchema.statics.ITEM_STATUSES = ITEM_STATUSES;

module.exports = mongoose.model("Order", orderSchema);
// routes/payment-router.js   (mounted in server.js as app.use("/api/payment", paymentRoute))
require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const router = express.Router();

// ───────── ADJUST THESE 3 IMPORTS TO YOUR PROJECT ─────────
const auth = require("../middleware/auth");   // copy the exact auth import line from user-router.js
const Order = require("../models/Order");     // your Order model
const Cart = require("../models/Cart");       // your Cart model
// ───────────────────────────────────────────────────────────

const isMock = process.env.PAYMENT_MODE === "mock";
const razorpay = isMock ? null : require("../utils/razorpay");

const GST_RATE = 0.135;        // 13.5%, same as your order summary
const COD_MAX_AMOUNT = 50000;  // COD limit in rupees. Set to null for no limit.
const FIRST_STATUS = "PLACED"; // ADJUST: must equal the FIRST key of STEPS in lib/orderStatus.js

const round2 = (n) => Math.round(Number(n) * 100) / 100;

/* ───────── helpers ───────── */

// Works whether your auth middleware sets req.user._id, req.user.id or req.userId
const getUserId = (req) => req.user?._id || req.user?.id || req.userId;

// Cart item -> order item. ADJUST the fallbacks if your cart items are shaped differently.
const toOrderItem = (i) => ({
  productId: i.productId || i.product?._id || i.product,
  name: i.name || i.product?.name,
  price: i.price ?? i.product?.price,
  quantity: i.quantity || 1,
  img: i.img || i.image || i.product?.img,
  oldPrice: i.oldPrice ?? i.product?.oldPrice,
  description: i.description || i.product?.description,
  imageColor: i.imageColor,
});

// The total is ALWAYS computed from the cart stored on the server,
// never from the amount the browser sends.
const buildFromCart = async (userId) => {
  const cart = await Cart.findOne({ $or: [{ user: userId }, { userId }] });
  const items = (cart?.items || []).map(toOrderItem);
  if (!items.length) return null;

  const cartTotal = round2(items.reduce((s, i) => s + Number(i.price) * i.quantity, 0));
  const gstAmount = round2(cartTotal * GST_RATE);
  const deliveryFee = 0;
  const total = round2(cartTotal + gstAmount + deliveryFee);

  const pricingDetails = [
    { label: "Cart Total", value: cartTotal },
    { label: "Cart Discount", value: 0 },
    { label: "Coupon Discount", value: 0 }, // TODO: apply coupons here on the server
    { label: "GST", value: gstAmount },
    { label: "Delivery Fee", value: deliveryFee },
    { label: "Order Total", value: total },
  ];

  return { items, total, pricingDetails };
};

const withStatus = (items, note) =>
  items.map((i) => ({
    ...i,
    status: FIRST_STATUS,
    statusHistory: [{ status: FIRST_STATUS, updatedAt: new Date(), note }],
  }));

const clearCart = (userId) =>
  Cart.updateOne({ $or: [{ user: userId }, { userId }] }, { $set: { items: [] } });

/* ───────── 1. ONLINE: create the Razorpay order ───────── */
router.post("/create-order", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { shippingAddress, billingAddress } = req.body;

    if (!shippingAddress)
      return res.status(400).json({ success: false, message: "Address required" });

    const built = await buildFromCart(userId);
    if (!built) return res.status(400).json({ success: false, message: "Cart is empty" });

    // Remove this user's earlier UNPAID online attempts so retries do not pile up as duplicates
    await Order.deleteMany({
      user: userId,
      "payment.method": "ONLINE",
      "payment.status": "created",
    });

    let razorpayOrder;
    if (isMock) {
      razorpayOrder = {
        id: "order_mock_" + Date.now(),
        amount: Math.round(built.total * 100),
        currency: "INR",
      };
    } else {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(built.total * 100), // paise
        currency: "INR",
        receipt: "rcpt_" + Date.now(),
      });
    }

    const order = await Order.create({
      user: userId,
      items: withStatus(built.items, "Order placed"),
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: {
        method: "ONLINE",
        status: "created", // stays unpaid until verified
        amount: built.total,
        pricingDetails: built.pricingDetails,
        razorpayOrderId: razorpayOrder.id,
      },
    });

    res.json({
      success: true,
      mock: isMock,
      razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID,
      orderDbId: order._id,
    });
  } catch (err) {
    console.error("create-order error:", err);
    res.status(500).json({ success: false, message: "Could not create order" });
  }
});

/* ───────── 2. ONLINE: verify the payment ───────── */
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findOne({
      user: userId,
      "payment.razorpayOrderId": razorpay_order_id,
    });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Already verified (for example a repeated call): just return it
    if (order.payment.status === "paid")
      return res.json({ success: true, orderId: order._id });

    if (!isMock) {
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (expected !== razorpay_signature)
        return res.status(400).json({ success: false, message: "Invalid signature" });

      order.payment.razorpayPaymentId = razorpay_payment_id;
    }

    order.payment.status = "paid";
    order.payment.paidAt = new Date();
    await order.save();
    await clearCart(userId);

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("verify-payment error:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
});

/* ───────── 3. CASH ON DELIVERY ───────── */
router.post("/place-cod-order", auth, async (req, res) => {
  try {
    const userId = getUserId(req);
    const { shippingAddress, billingAddress } = req.body;

    if (!shippingAddress)
      return res.status(400).json({ success: false, message: "Address required" });

    const built = await buildFromCart(userId);
    if (!built) return res.status(400).json({ success: false, message: "Cart is empty" });

    if (COD_MAX_AMOUNT && built.total > COD_MAX_AMOUNT)
      return res.status(400).json({
        success: false,
        message: `Cash on Delivery is available up to ₹${COD_MAX_AMOUNT.toLocaleString(
          "en-IN"
        )}. Please pay online.`,
      });

    const order = await Order.create({
      user: userId,
      items: withStatus(built.items, "Order placed (Cash on Delivery)"),
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: {
        method: "COD",
        status: "pending", // becomes "paid" when the courier collects the cash
        amount: built.total,
        pricingDetails: built.pricingDetails,
      },
    });

    await clearCart(userId);
    res.status(201).json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("COD error:", err);
    res.status(500).json({ success: false, message: "Could not place order" });
  }
});

module.exports = router;
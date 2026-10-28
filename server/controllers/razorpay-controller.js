const crypto = require("crypto");
const Order = require("../models/order-model");
const Cart = require("../models/cart-model");
const CartConfig = require("../models/pricing-model");

// COD rules (on/off switch and min/max amount) are set by the admin
const { checkCodAllowed } = require("./payment-admin-controller");

// PAYMENT_MODE=mock in .env = dummy online payments (never use in production)
const isMock = process.env.PAYMENT_MODE === "mock";

let razorpay = null;
if (!isMock) {
  const Razorpay = require("razorpay");
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// the logged-in user's id (use whatever your auth-middleware sets)
const getUserId = (req) => req.user?._id || req.userID || req.userId;

/* Shared: build items + totals from the DB cart (never trust the client) */
async function buildOrderData(userId, couponCode) {
  const cart = await Cart.findOne({ userId });

  if (!cart || !cart.items.length) {
    const e = new Error("Cart is empty");
    e.status = 400;
    throw e;
  }

  const config = (await CartConfig.findOne()) || {};

  const oldPrice = cart.items.reduce(
    (s, i) => s + (i.oldPrice || i.price) * i.quantity,
    0
  );
  const cartTotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  // Coupon
  let appliedCoupon = null;
  let couponDiscount = 0;
  if (couponCode) {
    const c = (config.availableCoupons || []).find(
      (x) => x.code.toLowerCase() === couponCode.toLowerCase()
    );
    const expired =
      c &&
      c.validityDays > 0 &&
      Date.now() > new Date(c.createdAt).getTime() + c.validityDays * 86400000;
    if (c && !expired) {
      couponDiscount = c.discount; // ASSUMPTION: flat rupees
      appliedCoupon = { code: c.code, discount: c.discount };
    }
  }
  const cartDiscount = config.cartDiscount || 0; // ASSUMPTION: flat rupees

  const subtotal = Math.max(0, cartTotal - cartDiscount - couponDiscount);

  // GST is added ON TOP, using each item's gst % (e.g. 3), scaled for discounts
  const rawGst = cart.items.reduce(
    (s, i) => s + (i.price * i.quantity * (i.gst || 0)) / 100,
    0
  );
  const gst = cartTotal > 0 ? Math.round(rawGst * (subtotal / cartTotal)) : 0;

  const delivery =
    config.minFreeDeliveryAmount > 0 && subtotal >= config.minFreeDeliveryAmount
      ? 0
      : config.deliveryFee || 0;

  const total = subtotal + gst + delivery;

  return {
    appliedCoupon,
    total,
    items: cart.items.map((i) => ({
      productId: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      img: i.img,
      oldPrice: i.oldPrice,
      gst: i.gst,
      description: i.description,
      imageColor: i.imageColor,
    })),
    orderSummary: {
      oldPrice,
      cartTotal,
      cartDiscount,
      couponDiscount,
      subtotal,
      gst,
      delivery,
      total,
    },
    pricingDetails: [
      { label: "Cart Total", value: cartTotal },
      { label: "Cart Discount", value: -cartDiscount },
      { label: "Coupon Discount", value: -couponDiscount },
      { label: "Subtotal", value: subtotal },
      { label: "GST", value: gst },
      { label: "Delivery Fee", value: delivery },
    ],
  };
}

// Copy fresh checkout data onto an existing pending online order
function applyDataToPendingOrder(
  order,
  data,
  rzpOrderId,
  shippingAddress,
  billingAddress
) {
  order.shippingAddress = shippingAddress;
  order.billingAddress = billingAddress || shippingAddress;
  order.items = data.items;
  order.orderSummary = data.orderSummary;
  order.payment.status = "pending";
  order.payment.method = "online";
  order.payment.razorpayOrderId = rzpOrderId;
  order.payment.amount = data.total;
  order.payment.pricingDetails = data.pricingDetails;
  order.payment.appliedCoupon = data.appliedCoupon;
  return order;
}

const pendingOnlineFilter = (userId) => ({
  userId,
  "payment.method": "online",
  "payment.status": "pending",
});

/* ONLINE step 1: create Razorpay order + ONE pending Order per user */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { shippingAddress, billingAddress, couponCode } = req.body;
    if (!shippingAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Shipping address is required" });
    }
    const userId = getUserId(req);
    const data = await buildOrderData(userId, couponCode);
    const amountInPaise = Math.round(data.total * 100);

    const rzpOrder = isMock
      ? { id: "order_mock_" + Date.now(), amount: amountInPaise, currency: "INR" }
      : await razorpay.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: "rcpt_" + Date.now(),
        });

    // Reuse the user's existing pending order instead of creating another one
    let order = await Order.findOne(pendingOnlineFilter(userId));

    if (order) {
      applyDataToPendingOrder(
        order,
        data,
        rzpOrder.id,
        shippingAddress,
        billingAddress
      );
      await order.save();
    } else {
      try {
        order = await Order.create({
          userId,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          items: data.items,
          orderSummary: data.orderSummary,
          payment: {
            status: "pending",
            method: "online",
            razorpayOrderId: rzpOrder.id,
            amount: data.total,
            pricingDetails: data.pricingDetails,
            appliedCoupon: data.appliedCoupon,
          },
        });
      } catch (err) {
        // Two requests arrived together: the unique index rejected the second one
        if (err.code === 11000) {
          order = await Order.findOne(pendingOnlineFilter(userId));
          if (!order) throw err;
          applyDataToPendingOrder(
            order,
            data,
            rzpOrder.id,
            shippingAddress,
            billingAddress
          );
          await order.save();
        } else {
          throw err;
        }
      }
    }

    res.json({
      success: true,
      mock: isMock,
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrder: rzpOrder,
      orderId: order._id,
    });
  } catch (err) {
    console.error("createRazorpayOrder error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err?.error?.description || err.message || "Could not create order",
    });
  }
};

/* ONLINE step 2: verify payment */
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpay_order_id,
      userId: getUserId(req),
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Already paid: callback fired twice, just return success
    if (order.payment.status === "paid") {
      return res.json({ success: true, orderId: order._id });
    }

    if (!isMock) {
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      const valid =
        razorpay_signature &&
        expected.length === razorpay_signature.length &&
        crypto.timingSafeEqual(
          Buffer.from(expected),
          Buffer.from(razorpay_signature)
        );

      if (!valid) {
        order.payment.status = "failed";
        await order.save();
        return res
          .status(400)
          .json({ success: false, message: "Invalid payment signature" });
      }
    }

    order.payment.status = "paid";
    order.payment.razorpayPaymentId =
      razorpay_payment_id || "pay_mock_" + Date.now();
    order.payment.razorpaySignature = razorpay_signature || "mock";
    await order.save();

    await Cart.updateOne({ userId: getUserId(req) }, { $set: { items: [] } });

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error("verifyRazorpayPayment error:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

/* COD: create the order directly, payment stays pending until delivery */
exports.placeCodOrder = async (req, res) => {
  try {
    const { shippingAddress, billingAddress, couponCode } = req.body;
    if (!shippingAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Shipping address is required" });
    }
    const userId = getUserId(req);
    const data = await buildOrderData(userId, couponCode);

    // Admin controls COD: on/off switch plus minimum and maximum order amount
    const codCheck = await checkCodAllowed(data.total);
    if (!codCheck.ok) {
      return res.status(403).json({ success: false, message: codCheck.message });
    }

    // Atomically take the cart. Only ONE request can succeed, so a double-click
    // cannot create two orders.
    const claimed = await Cart.findOneAndUpdate(
      { userId, "items.0": { $exists: true } },
      { $set: { items: [] } },
      { new: false }
    );
    if (!claimed) {
      return res.status(409).json({
        success: false,
        message: "This order has already been placed",
      });
    }

    let order;
    try {
      order = await Order.create({
        userId,
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        items: data.items,
        orderSummary: data.orderSummary,
        payment: {
          status: "pending",
          method: "cod",
          amount: data.total,
          pricingDetails: data.pricingDetails,
          appliedCoupon: data.appliedCoupon,
        },
      });
    } catch (err) {
      // Order was not saved: give the cart back
      await Cart.updateOne({ userId }, { $set: { items: claimed.items } });
      throw err;
    }

    res.json({ success: true, orderId: order._id, amount: data.total });
  } catch (err) {
    console.error("placeCodOrder error:", err);
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Could not place order" });
  }
};
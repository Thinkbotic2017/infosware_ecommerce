const Setting = require("../models/setting-model");
const Order = require("../models/order-model");

const PAID = /^(paid|success)$/i;

const loadSettings = () =>
  Setting.findOneAndUpdate(
    { key: "payment" },
    { $setOnInsert: { codEnabled: true } },
    { upsert: true, new: true }
  ).lean();

const toNum = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// orderSummary.total, else totalAmount, else items sum
const orderTotal = (o) => {
  const saved = toNum(o.orderSummary?.total) ?? toNum(o.totalAmount);
  if (saved !== null) return saved;
  return (o.items || []).reduce(
    (sum, i) => sum + (toNum(i.price) ?? 0) * (toNum(i.quantity) ?? 1),
    0
  );
};

const shapeSettings = (s) => ({
  codEnabled: s.codEnabled !== false,
  codMinAmount: Number(s.codMinAmount) || 0,
  codMaxAmount: Number(s.codMaxAmount) || 0,
});

// PUBLIC: checkout asks "is COD allowed, and for which amounts?"
exports.getPublicPaymentSettings = async (req, res) => {
  try {
    const s = await loadSettings();
    res.json(shapeSettings(s));
  } catch (e) {
    console.error("getPublicPaymentSettings:", e);
    res.status(500).json({ message: "Could not load settings" });
  }
};

exports.getPaymentSettings = exports.getPublicPaymentSettings;

exports.updatePaymentSettings = async (req, res) => {
  try {
    const update = {};

    if (req.body?.codEnabled !== undefined) {
      update.codEnabled = Boolean(req.body.codEnabled);
    }

    if (req.body?.codMinAmount !== undefined || req.body?.codMaxAmount !== undefined) {
      const current = shapeSettings(await loadSettings());
      const min = Number(req.body.codMinAmount ?? current.codMinAmount);
      const max = Number(req.body.codMaxAmount ?? current.codMaxAmount);

      if (!Number.isFinite(min) || !Number.isFinite(max) || min < 0 || max < 0) {
        return res.status(400).json({ message: "Amounts must be 0 or more." });
      }
      if (max > 0 && min > max) {
        return res.status(400).json({ message: "Minimum cannot be higher than maximum." });
      }
      update.codMinAmount = min;
      update.codMaxAmount = max;
    }

    const s = await Setting.findOneAndUpdate(
      { key: "payment" },
      { $set: update },
      { upsert: true, new: true }
    ).lean();

    res.json(shapeSettings(s));
  } catch (e) {
    console.error("updatePaymentSettings:", e);
    res.status(500).json({ message: "Could not update settings" });
  }
};

// Used by the order controller: can this order total use COD?
exports.checkCodAllowed = async (total) => {
  const s = shapeSettings(await loadSettings());
  if (!s.codEnabled) {
    return { ok: false, message: "Cash on Delivery is currently unavailable." };
  }
  if (s.codMinAmount > 0 && total < s.codMinAmount) {
    return {
      ok: false,
      message: `Cash on Delivery is available for orders of \u20B9${s.codMinAmount} or more.`,
    };
  }
  if (s.codMaxAmount > 0 && total > s.codMaxAmount) {
    return {
      ok: false,
      message: `Cash on Delivery is available for orders up to \u20B9${s.codMaxAmount}.`,
    };
  }
  return { ok: true };
};

// PAYMENTS PAGE: payment details, all statuses
exports.getPaymentHistory = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const { method, status } = req.query;

    const filter = {};
    if (method) filter["payment.method"] = method;
    if (status) filter["payment.status"] = new RegExp(`^${status}$`, "i");

    const [rows, total, paidRows] = await Promise.all([
      Order.find(filter)
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
      Order.find({ "payment.status": PAID })
        .select("items totalAmount orderSummary payment")
        .lean(),
    ]);

    const summary = paidRows.reduce(
      (acc, o) => {
        const amount = orderTotal(o);
        acc.totalPaid += amount;
        if (o.payment?.method === "cod") acc.cod += amount;
        else acc.online += amount;
        return acc;
      },
      { totalPaid: 0, online: 0, cod: 0 }
    );

    const payments = rows.map((o) => ({
      _id: o._id,
      user: o.userId?.username || o.userId?.email || "Customer",
      method: o.payment?.method || "-",
      status: o.payment?.status || "pending",
      razorpayOrderId: o.payment?.razorpayOrderId || "",
      razorpayPaymentId: o.payment?.razorpayPaymentId || "",
      amount: orderTotal(o),
      items: o.items?.length || 0,
      createdAt: o.createdAt,
    }));

    res.json({ payments, summary, page, pages: Math.ceil(total / limit), total });
  } catch (e) {
    console.error("getPaymentHistory:", e);
    res.status(500).json({ message: "Could not load payment history" });
  }
};

// SALES PAGE: only paid orders + total sales
exports.getSalesHistory = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Number(req.query.limit) || 15);
    const { method } = req.query;

    const filter = { "payment.status": PAID };
    if (method) filter["payment.method"] = method;

    const [rows, count, allPaid] = await Promise.all([
      Order.find(filter)
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
      Order.find({ "payment.status": PAID })
        .select("items totalAmount orderSummary payment")
        .lean(),
    ]);

    const totals = allPaid.reduce(
      (acc, o) => {
        const amount = orderTotal(o);
        acc.totalSales += amount;
        if (o.payment?.method === "cod") acc.codSales += amount;
        else acc.onlineSales += amount;
        return acc;
      },
      { totalSales: 0, onlineSales: 0, codSales: 0 }
    );

    const sales = rows.map((o) => ({
      _id: o._id,
      user: o.userId?.username || o.userId?.email || "Customer",
      method: o.payment?.method || "-",
      items: o.items?.length || 0,
      amount: orderTotal(o),
      createdAt: o.createdAt,
    }));

    res.json({
      ...totals,
      orderCount: allPaid.length,
      sales,
      page,
      pages: Math.ceil(count / limit),
    });
  } catch (e) {
    console.error("getSalesHistory:", e);
    res.status(500).json({ message: "Could not load sales" });
  }
};
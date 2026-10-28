const { Category, Banner, TRBanner } = require("../models/landingpage-model");
const Footer = require("../models/footer-model");
const Cart = require("../models/cart-model");
const ProductPage = require("../models/productPage-model");
const Order = require("../models/order-model");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Safely delete an uploaded file (ignores errors if it is already gone)
const removeFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Failed to delete file:", err.message);
  }
};

// Escape special characters so user text is safe inside a RegExp
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Matches "paid" or "success" in any upper/lower case
const PAID_STATUS = /^(paid|success)$/i;

// Order total: use orderSummary.total if it exists, else totalAmount,
// else add up item price x quantity.
const getOrderTotal = (order) => {
  const saved = order.orderSummary?.total ?? order.totalAmount;
  if (typeof saved === "number") return saved;

  return (order.items || []).reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
};

// Generic function for fetching all records
const getAll = (Model, modelName) => async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    if (!Model) {
      return res.status(500).json({ msg: `Model for ${modelName} not found` });
    }

    const data = await Model.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalDocuments = await Model.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);

    // Always return 200, even if no data
    return res.status(200).json({
      data,
      totalPages,
      currentPage: page,
      totalDocuments,
    });
  } catch (error) {
    next(error);
  }
};

// Generic function for fetching a single record by ID
const getById = (Model, modelName) => async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`Fetching ${modelName} with ID:`, id);

    const data = await Model.findById(id);
    if (!data) {
      return res.status(404).json({ msg: `${modelName} not found` });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(400)
      .json({ msg: `Error fetching ${modelName}`, error: error.message });
  }
};

// Function to update records by ID with image handling
const updateById = (Model, modelName) => async (req, res, next) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };
    console.log(`Updating ${modelName} with ID:`, id);

    // Trim the sub category name if it was sent
    if (typeof updateData.name === "string") {
      updateData.name = updateData.name.trim();
    }

    // Ensure color and priceAlert are included
    if (req.body.color !== undefined) updateData.color = req.body.color;
    if (req.body.priceAlert !== undefined)
      updateData.priceAlert = req.body.priceAlert;

    // Parse stringified fields back into arrays of objects
    if (typeof updateData.specifications === "string") {
      updateData.specifications = JSON.parse(updateData.specifications || "[]");
    }
    if (typeof updateData.productDescription === "string") {
      updateData.productDescription = JSON.parse(
        updateData.productDescription || "[]"
      );
    }
    if (typeof updateData.warranty === "string") {
      updateData.warranty = JSON.parse(updateData.warranty || "[]");
    }
    if (typeof updateData.reviews === "string") {
      updateData.reviews = JSON.parse(updateData.reviews || "[]");
    }
    if (typeof updateData.quesAns === "string") {
      updateData.quesAns = JSON.parse(updateData.quesAns || "[]");
    }
    if (typeof updateData.otherinfo === "string") {
      updateData.otherinfo = JSON.parse(updateData.otherinfo || "[]");
    }
    if (typeof updateData.offers === "string") {
      updateData.offers = JSON.parse(updateData.offers || "[]");
    }
    if (typeof updateData.attributes === "string") {
      updateData.attributes = JSON.parse(updateData.attributes);
    }
    if (typeof updateData.moreAttributes === "string") {
      updateData.moreAttributes = JSON.parse(updateData.moreAttributes);
    }
    if (typeof updateData.packingDelivery === "string") {
      updateData.packingDelivery = JSON.parse(updateData.packingDelivery);
    }
    if (typeof updateData.productDetails === "string") {
      updateData.productDetails = JSON.parse(updateData.productDetails);
    }

    if (req.file) {
      const existingRecord = await Model.findById(id);
      if (!existingRecord) {
        removeFile(req.file.path);
        return res.status(404).json({ msg: `${modelName} not found` });
      }

      // Delete the old image from disk
      if (existingRecord.img) {
        const oldImagePath = path.join(__dirname, "../", existingRecord.img);
        removeFile(oldImagePath);
      }
      updateData.img = `uploads/${req.file.filename}`;
    } else {
      const existingRecord = await Model.findById(id);
      if (existingRecord && existingRecord.img) {
        updateData.img = existingRecord.img;
      }
    }

    const updatedData = await Model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedData) {
      return res.status(404).json({ msg: `${modelName} not found` });
    }

    return res
      .status(200)
      .json({ msg: `${modelName} updated successfully`, data: updatedData });
  } catch (error) {
    console.error(`Error updating ${modelName}:`, error);
    return res
      .status(400)
      .json({ msg: `Error updating ${modelName}`, error: error.message });
  }
};

// Function to delete record by ID
const deleteById = (Model, modelName) => async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await Model.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ msg: `${modelName} not found` });
    }
    return res.status(200).json({ msg: `${modelName} deleted successfully` });
  } catch (error) {
    next(error);
  }
};

// Function to create a record
const create = (Model, modelName) => async (req, res, next) => {
  try {
    const {
      name,
      category,
      color,
      priceAlert,
      price,
      oldPrice,
      title,
      details,
      specifications,
      attributes,
      moreAttributes,
      packingDelivery,
      productDetails,
      description,
    } = req.body;

    const img = req.file ? `uploads/${req.file.filename}` : null;
    const type = modelName.toLowerCase();

    let newData;

    // ───────────── PRODUCT CARD / PRODUCT PAGE ─────────────
    if (type === "product card" || type === "productpage") {
      // Parse stringified fields back into arrays of objects
      const parsedSpecifications = specifications
        ? JSON.parse(specifications)
        : [];
      const parsedAttributes = attributes ? JSON.parse(attributes) : [];
      const parsedMoreAttributes = moreAttributes
        ? JSON.parse(moreAttributes)
        : [];
      const parsedPackingDelivery = packingDelivery
        ? JSON.parse(packingDelivery)
        : [];
      const parsedProductDetails = productDetails
        ? JSON.parse(productDetails)
        : [];

      newData = new Model({
        name,
        color,
        priceAlert,
        category,
        price,
        oldPrice,
        specifications: parsedSpecifications,
        attributes: parsedAttributes,
        moreAttributes: parsedMoreAttributes,
        packingDelivery: parsedPackingDelivery,
        productDetails: parsedProductDetails,
        img,
      });
    }

    // ───────────── CATEGORY (main category + sub category name) ─────────────
    else if (type === "category") {
      const subName = typeof name === "string" ? name.trim() : "";

      if (!category || !subName || !img) {
        if (req.file) removeFile(req.file.path);
        return res.status(400).json({
          msg: "All fields (category, name, img) are required",
        });
      }

      // ALLOWED TYPES
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(req.file.mimetype)) {
        removeFile(req.file.path);
        return res.status(400).json({
          msg: "Only JPG, PNG and WEBP images allowed",
        });
      }

      // FILE SIZE (frontend sends a compressed 500x500 image)
      const maxSize = 2 * 1024 * 1024; // 2 MB

      if (req.file.size > maxSize) {
        removeFile(req.file.path);
        return res.status(400).json({
          msg: "Image size must be under 2 MB",
        });
      }

      // IMAGE DIMENSIONS (frontend outputs exactly 500x500)
      const metadata = await sharp(req.file.path).metadata();

      if (metadata.width < 300 || metadata.height < 300) {
        removeFile(req.file.path);
        return res.status(400).json({
          msg: "Image must be at least 300 x 300 px",
        });
      }

      // DUPLICATE CHECK: same sub category name under the same main category
      const alreadyExists = await Model.findOne({
        category,
        name: { $regex: `^${escapeRegex(subName)}$`, $options: "i" },
      });

      if (alreadyExists) {
        removeFile(req.file.path);
        return res.status(400).json({
          msg: `"${subName}" already exists under ${category}`,
        });
      }

      newData = new Model({ category, name: subName, img });
    }

    // ───────────── BANNER ─────────────
    else if (type === "banner") {
      if (!name || !img) {
        if (req.file) removeFile(req.file.path);
        return res.status(400).json({ msg: "Name and image are required" });
      }
      newData = new Model({ name, img });
    }

    // ───────────── TR BANNER ─────────────
    else if (type === "trbanner") {
      if (!category || !img) {
        if (req.file) removeFile(req.file.path);
        return res.status(400).json({ msg: "Category and image are required" });
      }
      newData = new Model({ category, img });
    }

    // ───────────── FOOTER ─────────────
    else if (type === "footer") {
      let parsedDetails = details;
      if (typeof details === "string") {
        parsedDetails = JSON.parse(details);
      }
      if (!title || !description || !parsedDetails) {
        return res
          .status(400)
          .json({ msg: "Title, description, and details are required" });
      }
      newData = new Model({ title, description, details: parsedDetails });
    }

    // ───────────── UNKNOWN TYPE ─────────────
    else {
      return res
        .status(400)
        .json({ msg: `Unsupported record type: ${modelName}` });
    }

    await newData.save();

    return res
      .status(201)
      .json({ msg: `${modelName} created successfully`, data: newData });
  } catch (error) {
    // Clean up the uploaded file if saving failed
    if (req.file) removeFile(req.file.path);
    next(error);
  }
};

// Get count of paid orders in last 7 days
const getRecentConfirmedOrdersCount = async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const count = await Order.countDocuments({
      "payment.status": PAID_STATUS,
      createdAt: { $gte: oneWeekAgo },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent orders count" });
  }
};

// Total sales of all paid orders
const getTotalSale = async (req, res) => {
  try {
    const orders = await Order.find({ "payment.status": PAID_STATUS });
    const totalSale = orders.reduce(
      (sum, order) => sum + getOrderTotal(order),
      0
    );

    res.json({ totalSale });
  } catch (error) {
    console.error("getTotalSale:", error);
    res.status(500).json({ error: "Failed to fetch total sale" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, productId } = req.body;

    const validStatuses = [
      "PENDING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // FIND EXACT PRODUCT ITEM
    const item = order.items.find(
      (item) => (item.productId?._id || item.productId).toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product item not found",
      });
    }

    // UPDATE PRODUCT STATUS
    item.status = status;

    // PUSH HISTORY
    item.statusHistory.push({
      status,
      updatedAt: new Date(),
    });

    // DELIVERY DATE
    if (status === "DELIVERED") {
      item.deliveredAt = new Date();
    }

    await order.save();

    const updatedOrder = await Order.findById(orderId).populate(
      "items.productId"
    );

    res.status(200).json({
      success: true,
      message: "Product status updated",
      data: updatedOrder,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to update product status",
    });
  }
};

const cartNotification = async (req, res) => {
  try {
    // Fetch carts along with the user's details
    const carts = await Cart.find({
      "items.addedAt": { $lte: new Date(Date.now() - 1 * 60 * 1000) },
    }).populate("userId", "email phone");

    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart notifications" });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate("userId", "firstName email username")
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalDocuments = await Order.countDocuments();
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).json({
      success: true,
      data: orders,
      totalPages,
      currentPage: page,
      totalDocuments,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Exporting specific controllers using generic functions
module.exports = {
  getAllCategories: getAll(Category, "category"),
  getAllBanners: getAll(Banner, "banner"),
  findCategoryById: getById(Category, "category"),
  findBannerById: getById(Banner, "banner"),
  updateCategoryById: updateById(Category, "category"),
  updateBannerById: updateById(Banner, "banner"),
  deleteCategoryById: deleteById(Category, "category"),
  deleteBannerById: deleteById(Banner, "banner"),
  createCategory: create(Category, "category"),
  createBanner: create(Banner, "banner"),

  getAllTRBanner: getAll(TRBanner, "trbanner"),
  findTRBannerById: getById(TRBanner, "trbanner"),
  updateTRBannerById: updateById(TRBanner, "trbanner"),
  deleteTRBannerById: deleteById(TRBanner, "trbanner"),
  createTRBanner: create(TRBanner, "trbanner"),

  getAllFooter: getAll(Footer, "footer"),
  findFooterById: getById(Footer, "footer"),
  updateFooterById: updateById(Footer, "footer"),
  deleteFooterById: deleteById(Footer, "footer"),
  createFooter: create(Footer, "footer"),

  getAllCarts: getAll(Cart, "cart"),
  getCart: getById(Cart, "cart"),
  updateCartById: updateById(Cart, "cart"),
  deleteCartById: deleteById(Cart, "cart"),

  getAllProductCards: getAll(ProductPage, "product card"),
  getProductCardById: getById(ProductPage, "product card"),
  createProductCard: create(ProductPage, "product card"),
  updateProductCardById: updateById(ProductPage, "product card"),
  deleteProductCardById: deleteById(ProductPage, "product card"),

  getRecentConfirmedOrdersCount,
  getTotalSale,

  updateOrderStatus,
  cartNotification,
  getRecentOrders,
};
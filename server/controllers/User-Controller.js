const mongoose = require("mongoose");
const Address = require("../models/address-model");
const Cart = require("../models/cart-model");
const Wishlist = require("../models/wishlist-model");
const ProductPage = require("../models/productPage-model");
const Order = require("../models/order-model");
const CartConfig = require("../models/pricing-model");

// ==================== ADDRESS FUNCTIONS ====================
// All address functions use the logged-in user (req.userID from auth middleware),
// never an ID sent by the client.

const getAllAddresses = async (req, res, next) => {
  try {
    const userId = req.userID;

    if (!userId) {
      return res.status(401).json({ msg: "User authentication required" });
    }

    const addresses = await Address.find({ userId });
    return res.status(200).json(addresses || []);
  } catch (error) {
    next(error);
  }
};

const getAddressById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    if (!userId) {
      return res.status(401).json({ msg: "User authentication required" });
    }

    const address = await Address.findOne({ _id: id, userId });

    if (!address) {
      return res.status(200).json(null);
    }

    return res.status(200).json(address);
  } catch (error) {
    next(error);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const userId = req.userID;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    let {
      fullName,
      businessName,
      gst,
      address,
      street,
      landmark,
      city,
      state,
      zipCode,
      mobile,
      altMobile,
      type,
    } = req.body;

    fullName = fullName?.trim();
    businessName = businessName?.trim();
    gst = gst?.trim();
    address = address?.trim();
    street = street?.trim();
    landmark = landmark?.trim();
    city = city?.trim();
    state = state?.trim();
    zipCode = zipCode?.trim();
    mobile = mobile?.trim();
    altMobile = altMobile?.trim();

    if (
      !fullName ||
      !address ||
      !street ||
      !city ||
      !state ||
      !zipCode ||
      !mobile ||
      !type
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const nameRegex = /^[A-Za-z ]+$/;

    if (!nameRegex.test(fullName)) {
      return res.status(400).json({
        success: false,
        message: "Full name should contain only letters",
      });
    }

    if (!nameRegex.test(city)) {
      return res.status(400).json({
        success: false,
        message: "Invalid city name",
      });
    }

    if (!nameRegex.test(state)) {
      return res.status(400).json({
        success: false,
        message: "Invalid state name",
      });
    }

    const mobileRegex = /^[0-9]{10}$/;

    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Mobile number must be 10 digits",
      });
    }

    if (altMobile && !mobileRegex.test(altMobile)) {
      return res.status(400).json({
        success: false,
        message: "Alternate mobile must be 10 digits",
      });
    }

    const zipRegex = /^[0-9]{6}$/;

    if (!zipRegex.test(zipCode)) {
      return res.status(400).json({
        success: false,
        message: "Zip code must be 6 digits",
      });
    }

    if (gst) {
      const gstRegex = /^[0-9A-Z]{15}$/;

      if (!gstRegex.test(gst)) {
        return res.status(400).json({
          success: false,
          message: "Invalid GST number",
        });
      }
    }

    // Don't save the same address twice for the same user
    const duplicate = await Address.findOne({
      userId,
      fullName,
      address,
      street,
      city,
      state,
      zipCode,
      mobile,
    });

    if (duplicate) {
      return res.status(200).json({
        success: true,
        message: "Address already saved",
        data: duplicate,
      });
    }

    const newAddress = new Address({
      userId,
      fullName,
      businessName,
      gst,
      address,
      street,
      landmark,
      city,
      state,
      zipCode,
      mobile,
      altMobile,
      type,
    });

    await newAddress.save();

    return res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: newAddress,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: errors[0],
      });
    }

    next(error);
  }
};

const updateAddressById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    if (!userId) {
      return res.status(401).json({ msg: "User authentication required" });
    }

    // never let the client change who owns the address
    const { userId: _ignored, ...updates } = req.body;

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({
        msg: "Address not found",
      });
    }

    return res.status(200).json({
      msg: "Address updated successfully",
      data: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddressById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    if (!userId) {
      return res.status(401).json({ msg: "User authentication required" });
    }

    const deletedAddress = await Address.findOneAndDelete({ _id: id, userId });

    if (!deletedAddress) {
      return res.status(404).json({
        msg: "Address not found",
      });
    }

    return res.status(200).json({
      msg: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==================== CART FUNCTIONS ====================

// Handles a missing cart without accessing cart.items.
const getCart = async (req, res) => {
  const userId = req.userID;

  try {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const cart = await Cart.findOne({ userId });

    // No cart exists for this user.
    if (!cart) {
      return res.status(200).json({
        items: [],
        cartDiscount: 0,
        deliveryFee: 0,
        gatewayCharges: 0,
        gst: 0,
        appliedCoupon: "",
        availableCoupons: [],
      });
    }

    // Cart exists but has no items.
    if (!Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(200).json({
        ...cart.toObject(),
        items: [],
        cartDiscount: cart.cartDiscount ?? 0,
        deliveryFee: cart.deliveryFee ?? 0,
        gatewayCharges: cart.gatewayCharges ?? 0,
        gst: cart.gst ?? 0,
        appliedCoupon: cart.appliedCoupon ?? "",
        availableCoupons: cart.availableCoupons ?? [],
      });
    }

    return res.status(200).json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userID;

  try {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!productId || !Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: "Valid productId and quantity are required",
      });
    }

    const requestedQuantity = Number(quantity);

    let cart = await Cart.findOne({ userId });

    const product = await ProductPage.findOne({
      _id: productId,
      catalogStatus: { $ne: "draft" },
    });

    if (!product) {
      return res.status(404).json({
        msg: "Product not found",
      });
    }

    if (product.stock < requestedQuantity) {
      return res.status(400).json({
        msg: "Insufficient stock",
      });
    }

    if (!cart) {
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            quantity: requestedQuantity,
            price: product.price,
            name: product.name,
            img: product.img,
            imageColor:
              req.body.imageColor ||
              product.images?.[0]?.imageColor ||
              "",
            oldPrice: product.oldPrice || 0,
            gst: product.gst || 0,
            description: product.descriptions || "",
          },
        ],
      });
    } else {
      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.productId?.toString() === productId.toString()
      );

      if (itemIndex > -1) {
        const newQuantity =
          cart.items[itemIndex].quantity + requestedQuantity;

        if (newQuantity > product.stock) {
          return res.status(400).json({
            msg: "Insufficient stock",
          });
        }

        cart.items[itemIndex].quantity = newQuantity;
      } else {
        cart.items.push({
          productId,
          quantity: requestedQuantity,
          price: product.price,
          name: product.name,
          img: product.img,
          imageColor:
            req.body.imageColor ||
            product.images?.[0]?.imageColor ||
            "",
          oldPrice: product.oldPrice || 0,
          gst: product.gst || 0,
          description: product.descriptions || "",
        });
      }
    }

    await cart.save();

    return res.status(200).json({
      msg: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Error adding product to cart:", error);

    return res.status(500).json({
      error: "Failed to add product to cart",
    });
  }
};

const removeFromCart = async (req, res) => {
  const userId = req.userID;
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        msg: "Cart not found",
      });
    }

    cart.items = (cart.items || []).filter(
      (item) => item.productId?.toString() !== productId
    );

    await cart.save();

    return res.status(200).json({
      msg: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Error removing product from cart:", error);

    return res.status(500).json({
      error: "Failed to remove product from cart",
    });
  }
};

const updateCart = async (req, res) => {
  const userId = req.userID;
  const { cartItems } = req.body;

  try {
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!Array.isArray(cartItems)) {
      return res.status(400).json({
        success: false,
        message: "cartItems must be an array",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [],
      });
    }

    cart.items = cartItems;

    await cart.save();

    return res.status(200).json({
      msg: "Cart updated",
      cart,
    });
  } catch (error) {
    console.error("Error updating cart:", error);

    return res.status(500).json({
      error: "Failed to update cart",
    });
  }
};

// ==================== WISHLIST FUNCTIONS ====================

const getWishlist = async (req, res) => {
  const userId = req.userID;

  try {
    const wishlist = await Wishlist.findOne({ userId }).populate("products");

    if (!wishlist) {
      return res.status(200).json([]);
    }

    return res.status(200).json(wishlist.products);
  } catch (error) {
    console.error("Error fetching wishlist:", error);

    return res.status(500).json({
      error: "Failed to fetch wishlist",
    });
  }
};

const addToWishlist = async (req, res) => {
  const userId = req.userID;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      error: "productId is required",
    });
  }

  try {
    const product = await ProductPage.findOne({
      _id: productId,
      catalogStatus: { $ne: "draft" },
    }).select("_id");

    if (!product) {
      return res.status(404).json({
        msg: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        products: [productId],
      });
    } else {
      const alreadyExists = wishlist.products.some(
        (id) => id.toString() === productId.toString()
      );

      if (alreadyExists) {
        return res.status(200).json({
          msg: "Product already in wishlist",
        });
      }

      wishlist.products.push(productId);
    }

    await wishlist.save();

    return res.status(200).json({
      msg: "Added to wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Error adding product to wishlist:", error);

    return res.status(500).json({
      error: "Failed to add to wishlist",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  const userId = req.userID;
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({
      error: "productId is required",
    });
  }

  try {
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        error: "Wishlist not found",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    return res.status(200).json({
      msg: "Removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);

    return res.status(500).json({
      error: "Failed to remove from wishlist",
    });
  }
};

// ==================== ORDER FUNCTIONS ====================
// Orders are created in razorpay-controller.js (online + COD).
// This file only reads them.

const DONE = ["DELIVERED", "CANCELLED"];

// Hide online orders that were never paid (customer closed the Razorpay window)
const visibleFilter = (userId) => ({
  userId,
  $nor: [
    {
      "payment.method": "online",
      "payment.status": { $in: ["pending", "failed"] },
    },
  ],
});

// current = at least one item still in progress; history = every item finished
const tabFilter = {
  current: { items: { $elemMatch: { status: { $nin: DONE } } } },
  history: { items: { $not: { $elemMatch: { status: { $nin: DONE } } } } },
};

const cleanOrder = (order) => {
  const o = order.toObject();
  if (!o.payment) o.payment = {};
  if (!Array.isArray(o.payment.pricingDetails)) o.payment.pricingDetails = [];
  if (!o.payment.appliedCoupon) o.payment.appliedCoupon = null;
  return o;
};

const getOrdersByUser = async (req, res) => {
  try {
    const userId = req.userID;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 1000, 1); // all orders by default
    const tab = req.query.tab; // optional: "current" or "history"

    const base = visibleFilter(userId);
    const query = tabFilter[tab] ? { ...base, ...tabFilter[tab] } : base;

    const [orders, totalOrders, currentCount, historyCount] = await Promise.all([
      Order.find(query)
        .populate("items.productId")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments(query),
      Order.countDocuments({ ...base, ...tabFilter.current }),
      Order.countDocuments({ ...base, ...tabFilter.history }),
    ]);

    return res.status(200).json({
      data: orders.map(cleanOrder),
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      counts: { current: currentCount, history: historyCount },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Only the owner can open an order
    const order = await Order.findOne({
      _id: orderId,
      userId: req.userID,
    }).populate("items.productId");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.status(200).json(cleanOrder(order));
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
};

// ==================== PRODUCT REVIEWS ====================

const rateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    const product = await ProductPage.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    product.reviews = (product.reviews || []).filter(
      (r) => r.userId?.toString() !== userId.toString()
    );

    product.reviews.push({
      userId,
      rating: numericRating,
      key: req.user?.username || req.user?.email || "Anonymous",
      value: review?.trim() || "",
    });

    product.ratingCount = product.reviews.length;
    product.ratingTotal = product.reviews.reduce(
      (sum, r) => sum + (r.rating || 0),
      0
    );

    product.rating =
      product.ratingCount > 0
        ? Number(
            (product.ratingTotal / product.ratingCount).toFixed(1)
          )
        : 0;

    await product.save();

    return res.status(200).json({
      msg: "Rating submitted",
      rating: product.rating,
    });
  } catch (error) {
    console.error("Error rating product:", error);

    return res.status(500).json({
      error: "Failed to rate product",
    });
  }
};

const getMyProductRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    const product = await ProductPage.findById(productId);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    const userReview = (product.reviews || []).find(
      (r) => r.userId?.toString() === userId.toString()
    );

    return res.json({
      rating: userReview?.rating || 0,
    });
  } catch (error) {
    console.error("Error fetching user rating:", error);

    return res.status(500).json({
      error: "Failed to fetch user rating",
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const userId = req.user?._id?.toString();

    if (!userId) {
      return res.status(401).json({
        error: "User authentication required",
      });
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 5, 1);

    const products = await ProductPage.find({
      "reviews.userId": userId,
    });

    const reviews = [];

    products.forEach((product) => {
      (product.reviews || []).forEach((review) => {
        if (review.userId?.toString() === userId) {
          reviews.push({
            productId: product._id,
            productName: product.name,
            productImg: product.img,
            rating: review.rating,
            review: review.value,
            createdAt: review.createdAt,
          });
        }
      });
    });

    reviews.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const totalDocuments = reviews.length;
    const totalPages = Math.ceil(totalDocuments / limit);
    const startIndex = (page - 1) * limit;

    return res.status(200).json({
      reviews: reviews.slice(startIndex, startIndex + limit),
      currentPage: page,
      totalPages,
      totalDocuments,
    });
  } catch (error) {
    console.error("Error fetching user reviews:", error);

    return res.status(500).json({
      error: "Failed to fetch user reviews",
    });
  }
};

// ==================== CART PRICING CONFIG ====================

const getCartConfig = async (req, res) => {
  try {
    let config = await CartConfig.findOne();

    if (!config) {
      config = await CartConfig.create({});
    }

    const now = new Date();

    const validCoupons = (config.availableCoupons || []).filter((coupon) => {
      if (!coupon.validityDays) {
        return true;
      }

      const expiry = new Date(coupon.createdAt);
      expiry.setDate(expiry.getDate() + coupon.validityDays);

      return expiry > now;
    });

    return res.status(200).json({
      ...config.toObject(),
      availableCoupons: validCoupons,
    });
  } catch (error) {
    console.error("Error fetching cart config:", error);

    return res.status(500).json({
      error: "Failed to fetch cart config",
    });
  }
};

const updateCartConfig = async (req, res) => {
  try {
    let config = await CartConfig.findOne();

    if (!config) {
      config = await CartConfig.create(req.body);
    } else {
      Object.assign(config, req.body);
      await config.save();
    }

    return res.status(200).json(config);
  } catch (error) {
    console.error("Error updating cart config:", error);

    return res.status(500).json({
      error: "Failed to update cart config",
    });
  }
};

// ==================== EXPORTS ====================

module.exports = {
  getAllAddresses,
  getAddressById,
  createAddress,
  updateAddressById,
  deleteAddressById,

  getCart,
  addToCart,
  removeFromCart,
  updateCart,

  getCartConfig,
  updateCartConfig,

  getWishlist,
  addToWishlist,
  removeFromWishlist,

  getOrdersByUser,
  getOrderById,

  rateProduct,
  getMyProductRating,
  getMyReviews,
};
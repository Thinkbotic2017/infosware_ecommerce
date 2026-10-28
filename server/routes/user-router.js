const express = require("express");
const userController = require("../controllers/User-Controller");
const razorpayController = require("../controllers/razorpay-controller");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const { addRecentlyViewed, getRecentlyViewed } = require("../controllers/recently-ViewedController");
const { createContact, getAllQueries, getOneQuery, updateQueryStatus } = require("../controllers/contactController");
const { getOrderSummary } = require("../controllers/OrderSummary-Controller");

const router = express.Router();

/*=================================
          User Address Routes
====================================*/
router.route("/addresses/:userId")
    .get(authMiddleware, userController.getAllAddresses);

router.route("/addresses")
    .post(authMiddleware, userController.createAddress);

router.route("/address/:id")
    .get(authMiddleware, userController.getAddressById)
    .put(authMiddleware, userController.updateAddressById)
    .delete(authMiddleware, userController.deleteAddressById);

/*=================================
           Cart-router
===================================*/
router.route("/cart").get(authMiddleware, userController.getCart);
router.route("/cart").post(authMiddleware, userController.addToCart);
router.route("/cart/remove/:productId").delete(authMiddleware, userController.removeFromCart);
router.route("/cart/update").post(authMiddleware, userController.updateCart);

// pricing
router.get("/cart-config", authMiddleware, userController.getCartConfig);
router.post("/cart-config", authMiddleware, adminMiddleware, userController.updateCartConfig);

/*=================================
           Wishlist-router
====================================*/
router.route("/wishlist").get(authMiddleware, userController.getWishlist);
router.route("/wishlist").post(authMiddleware, userController.addToWishlist);
router.route("/wishlist/:productId").delete(authMiddleware, userController.removeFromWishlist);

/*=================================
     Order + Payment Routes
====================================*/
// Online payment (Razorpay)
router.post("/create-order", authMiddleware, razorpayController.createRazorpayOrder);
router.post("/verify-payment", authMiddleware, razorpayController.verifyRazorpayPayment);

// Cash on Delivery
router.post("/place-cod-order", authMiddleware, razorpayController.placeCodOrder);

// Order list + tracking
router.get("/orders", authMiddleware, userController.getOrdersByUser);
router.get("/order/:orderId", authMiddleware, userController.getOrderById);

/*=================================
        Ratings / Reviews
====================================*/
router.post("/product/:productId/rate", authMiddleware, userController.rateProduct);
router.get("/product/:productId/my-rating", authMiddleware, userController.getMyProductRating);
router.get("/my-reviews", authMiddleware, userController.getMyReviews);

// recently viewed
router.post("/recentlyViewed", authMiddleware, addRecentlyViewed);
router.get("/recentlyViewed", authMiddleware, getRecentlyViewed);

// contact queries
router.post("/contact/create", authMiddleware, createContact);
router.get("/contact", authMiddleware, getAllQueries);
router.get("/contact/:id", authMiddleware, getOneQuery);
router.put("/contact/status/:id", authMiddleware, updateQueryStatus);

// order summary
router.get("/orderSummary", authMiddleware, getOrderSummary);

module.exports = router;
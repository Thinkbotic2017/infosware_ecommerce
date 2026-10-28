const express = require("express");
const adminUserController = require("../controllers/admin-userController");
const adminController = require("../controllers/admin-Controller");
const adminNavController = require("../controllers/Admin-navController");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const { uploadSingle, uploadMultiple } = require("../middleware/upload-middleware");
const adminProductController = require("../controllers/admin-productController");
const { addBanner, deleteBanner, getBanners, updateBanner } = require("../controllers/banner-Controller");
const { getFooter, createFooter, deleteFooter, updateFooter } = require("../controllers/footer-Controller");

// NEW PAYMENTS: payment history + COD on/off + SALES history
const {
  getPaymentHistory,
  getPaymentSettings,
  updatePaymentSettings,
  getSalesHistory, // SALES
} = require("../controllers/payment-admin-controller");

const Order = require("../models/order-model"); // NEW: use your real Order model path

const router = express.Router();

/*..........................................
..............Users Routes
..........................................*/
router.route("/users")
    .get(authMiddleware, adminMiddleware, adminUserController.getAllUsers);

router.route("/users/:id")
    .get(authMiddleware, adminMiddleware, adminUserController.getUserById);

router.route("/users/update/:id")
    .put(authMiddleware, adminMiddleware, adminUserController.updateUserById);

router.route("/users/delete/:id")
    .delete(authMiddleware, adminMiddleware, adminUserController.deleteUserById);

/*..........................................
..........Landing Page Routes................
..........................................*/
router.route("/landingpage/categories")
    .get(authMiddleware, adminMiddleware, adminController.getAllCategories)
    .post(authMiddleware, adminMiddleware, uploadSingle, adminController.createCategory);

router.route("/landingpage/category/:id")
    .get(authMiddleware, adminMiddleware, adminController.findCategoryById)
    .put(authMiddleware, adminMiddleware, uploadSingle, adminController.updateCategoryById)
    .delete(authMiddleware, adminMiddleware, adminController.deleteCategoryById);

router.route("/landingpage/banners")
    .get(authMiddleware, adminMiddleware, adminController.getAllBanners)
    .post(authMiddleware, adminMiddleware, uploadSingle, adminController.createBanner);

router.route("/landingpage/banner/:id")
    .get(authMiddleware, adminMiddleware, adminController.findBannerById)
    .put(authMiddleware, adminMiddleware, uploadSingle, adminController.updateBannerById)
    .delete(authMiddleware, adminMiddleware, adminController.deleteBannerById);

/*..........................................
..........TRBanner Routes................
..........................................*/
router.route("/landingpage/trbanner")
    .get(authMiddleware, adminMiddleware, adminController.getAllTRBanner)
    .post(authMiddleware, adminMiddleware, uploadSingle, adminController.createTRBanner);

router.route("/landingpage/trbanner/:id")
    .get(authMiddleware, adminMiddleware, adminController.findTRBannerById)
    .put(authMiddleware, adminMiddleware, uploadSingle, adminController.updateTRBannerById)
    .delete(authMiddleware, adminMiddleware, adminController.deleteTRBannerById);

/*..........................................
..........Navbar Routes................
..........................................*/
router
    .route("/navbar")
    .get(authMiddleware, adminMiddleware, adminNavController.getAllNavbars);

router
    .route("/navbar/logo")
    .post(authMiddleware, adminMiddleware, uploadSingle, adminNavController.addLogo);

router
    .route("/navbar/:id/logo")
    .put(authMiddleware, adminMiddleware, uploadSingle, adminNavController.updateLogoById)
    .delete(authMiddleware, adminMiddleware, adminNavController.deleteLogoById);

/*..........................................
..........Footer Routes................
..........................................*/
router.route("/landingpage/footer").get(getFooter);
router.route("/landingpage/footer").post(authMiddleware, adminMiddleware, createFooter);

router.route("/landingpage/footer/:id").put(authMiddleware, adminMiddleware, updateFooter);
router.route("/landingpage/footer/:id").delete(authMiddleware, adminMiddleware, deleteFooter);

/*..........................................
..........Carts Routes................
..........................................*/
router.route("/carts")
    .get(authMiddleware, adminMiddleware, adminController.getAllCarts);

router.route("/carts/:id")
    .get(authMiddleware, adminMiddleware, adminController.getCart)
    .put(authMiddleware, adminMiddleware, adminController.updateCartById)
    .delete(authMiddleware, adminMiddleware, adminController.deleteCartById);

/*..........................................
..........ProductPages Routes................
..........................................*/
router.route("/productpage")
    .get(authMiddleware, adminMiddleware, adminProductController.getAllProductPages)
    .post(authMiddleware, adminMiddleware, uploadMultiple, adminProductController.createProductPage);

/*..........................................
..........ProductDetails Routes................
..........................................*/
router.route("/productdetails")
    .get(authMiddleware, adminMiddleware, adminProductController.getAllProductDetails)
    .post(authMiddleware, adminMiddleware, adminProductController.createProductDetails);

router.route("/productdetails/:id")
    .get(authMiddleware, adminMiddleware, adminProductController.getProductDetailsById)
    .put(authMiddleware, adminMiddleware, adminProductController.updateProductDetailsById)
    .delete(authMiddleware, adminMiddleware, adminProductController.deleteProductDetailsById);

/*..........................................
..........ProductCards Routes................
..........................................*/
router.route("/productcards")
    .get(authMiddleware, adminMiddleware, adminController.getAllProductCards)
    .post(authMiddleware, adminMiddleware, uploadSingle, adminController.createProductCard);

router.route("/productcards/:id")
    .get(authMiddleware, adminMiddleware, adminController.getProductCardById)
    .put(authMiddleware, adminMiddleware, uploadSingle, adminController.updateProductCardById)
    .delete(authMiddleware, adminMiddleware, adminController.deleteProductCardById);

router
    .route("/productpage/:id/image")
    .delete(authMiddleware, adminMiddleware, adminProductController.deleteProductImage);

/*..........................................
..........ProductInquiry Routes................
..........................................*/
router.route("/inquiry")
    .get(authMiddleware, adminMiddleware, adminProductController.getProductInquiry);
router.route("/inquiry/:id")
    .delete(authMiddleware, adminMiddleware, adminProductController.deleteProductInquiry);
router.route("/inquiry/count")
    .get(authMiddleware, adminMiddleware, adminProductController.getProductInquiryCount);

/*..........................................
..........Orders Routes................
..........................................*/
router.route("/orders/recent-count")
    .get(authMiddleware, adminMiddleware, adminController.getRecentConfirmedOrdersCount);

router.route("/orders/total-sale")
    .get(authMiddleware, adminMiddleware, adminController.getTotalSale);

// Existing status route (unchanged)
router.put(
  "/order/:orderId/status",
  authMiddleware,
  adminMiddleware,
  adminController.updateOrderStatus
);

// NEW: list all orders (for the admin orders page)
router.get("/orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "username email")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// NEW: update ONE product's tracking status inside an order
router.patch(
  "/orders/:orderId/items/:itemId/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { status, note, courierName, trackingId, estimatedDelivery } = req.body;
      const order = await Order.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      await order.updateItemStatus(req.params.itemId, status, note, {
        courierName,
        trackingId,
        estimatedDelivery,
      });

      res.json({ success: true, order });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

/*..........................................
..........NEW PAYMENTS + SALES Routes................
..........................................*/
router.route("/payments")
    .get(authMiddleware, adminMiddleware, getPaymentHistory);

router.route("/payment-settings")
    .get(authMiddleware, adminMiddleware, getPaymentSettings)
    .put(authMiddleware, adminMiddleware, updatePaymentSettings);

// SALES: paid orders only + total sales
router.route("/sales")
    .get(authMiddleware, adminMiddleware, getSalesHistory);

// User submits question
router.route("/productpage/:productId/question")
    .post(authMiddleware, adminProductController.addProductQuestion);

// Admin answers question
router.route("/productpage/:productId/question/:qaId")
    .put(authMiddleware, adminMiddleware, adminProductController.answerProductQuestion);

// get pending question
router.route("/productpage/pendingques")
    .get(authMiddleware, adminMiddleware, adminProductController.getPendingQuestion);

router.route("/productpage/:id")
    .get(authMiddleware, adminMiddleware, adminProductController.getProductPageById)
    .put(authMiddleware, adminMiddleware, uploadMultiple, adminProductController.updateProductPageById)
    .delete(authMiddleware, adminMiddleware, adminProductController.deleteProductPageById);

router.route("/cart-notifications")
    .get(authMiddleware, adminMiddleware, adminController.cartNotification);

router.route("/banner").post(authMiddleware, adminMiddleware, uploadSingle, addBanner);
router.route("/banner").get(getBanners);
router.route("/banner/:id").put(authMiddleware, adminMiddleware, uploadSingle, updateBanner);
router.route("/banner/:id").delete(authMiddleware, adminMiddleware, deleteBanner);

router.route("/recentOrders")
    .get(authMiddleware, adminMiddleware, adminController.getRecentOrders);

module.exports = router;

const express = require("express");
const router = express.Router();

const authcontrollers = require("../controllers/auth-controller");
const validate = require("../middleware/validate-middleware");
const authMiddleware = require("../middleware/auth-middleware");

const { signUpSchema } = require("../validators/auth-validator");

// Home
router.get("/", authcontrollers.home);

// Register with username, phone, email, and password
router.post(
  "/signUp",
  validate(signUpSchema),
  authcontrollers.signUp
);

// Login with username and password
router.post("/login", authcontrollers.login);

// Get authenticated user
router.get(
  "/user",
  authMiddleware,
  authcontrollers.user
);

// Update user profile
router.put(
  "/update/:id",
  authMiddleware,
  authcontrollers.updateUserById
);

// Logout
router.post(
  "/logout",
  authMiddleware,
  authcontrollers.logout
);

module.exports = router;

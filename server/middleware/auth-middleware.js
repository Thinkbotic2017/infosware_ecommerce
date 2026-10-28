const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

const authMiddleware = async (req, res, next) => {
  const jwtToken = req.cookies.token;
  if (!jwtToken) {
    return res.status(401).json({ message: "Unauthorized HTTP, Token not provided" });
  }

  try {
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET);

    // Prefer the permanent id; fall back to email for old tokens
    const userData = isVerified.userId
      ? await User.findById(isVerified.userId).select({ password: 0 })
      : await User.findOne({ email: isVerified.email }).select({ password: 0 });

    if (!userData) {
      return res.status(401).json({ message: "Unauthorized. User account not found." });
    }

    req.user = userData;
    req.userID = userData._id;
    req.productId = req.params.id;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized. Invalid token." });
  }
};

module.exports = authMiddleware;
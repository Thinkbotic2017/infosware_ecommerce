
const User = require("../models/user-model");

// ---------------- COOKIE CONFIGURATION ----------------

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
};

// Remove sensitive fields before sending a user to the frontend.
const sanitizeUser = (user) => {
  const userObject = user.toObject
    ? user.toObject()
    : { ...user };

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

// ---------------- HOME ----------------

const home = async (req, res) => {
  return res.status(200).send("Welcome to Home Page");
};

// ---------------- SIGNUP ----------------

const signUp = async (req, res) => {
  try {
    const {
      username,
      firstname,
      lastname,
      email,
      password,
    } = req.body;

    let { phone } = req.body;

    // Validate required fields
    if (
      !username?.trim() ||
      !firstname?.trim() ||
      !lastname?.trim() ||
      !email?.trim() ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        msg: "Please provide all required fields.",
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    phone = String(phone).replace(/\D/g, "");

    if (phone.length !== 10) {
      return res.status(400).json({
        msg: "Phone number must contain exactly 10 digits.",
      });
    }

    // Store Indian phone numbers in a consistent format.
    phone = `+91${phone}`;

    if (password.length < 8) {
      return res.status(400).json({
        msg: "Password must be at least 8 characters long.",
      });
    }

    // Check for existing accounts
    const existingUser = await User.findOne({
      $or: [
        { username: normalizedUsername },
        { email: normalizedEmail },
        { phone },
      ],
    });

    if (existingUser) {
      if (existingUser.username === normalizedUsername) {
        return res.status(409).json({
          msg: "Username already exists.",
        });
      }

      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({
          msg: "Email already exists.",
        });
      }

      if (existingUser.phone === phone) {
        return res.status(409).json({
          msg: "Phone number already exists.",
        });
      }
    }

    // The user-model pre-save middleware hashes the password.
    const newUser = await User.create({
      username: normalizedUsername,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: normalizedEmail,
      phone,
      password,
    });

    const token = newUser.generateToken();

    res.cookie("token", token, cookieOptions);

    return res.status(201).json({
      success: true,
      msg: "Registration successful.",
      token,
      userId: newUser._id.toString(),
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error("Signup error:", error);

    // Handle duplicate-key errors, including concurrent requests.
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];

      const messages = {
        username: "Username already exists.",
        email: "Email already exists.",
        phone: "Phone number already exists.",
      };

      return res.status(409).json({
        msg: messages[field] || "An account with these details already exists.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        msg: error.message,
      });
    }

    return res.status(500).json({
      msg: "Unable to create account. Please try again.",
    });
  }
};

// ---------------- USERNAME AND PASSWORD LOGIN ----------------

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
      return res.status(400).json({
        msg: "Username and password are required.",
      });
    }

    // The model uses select: false for password, so explicitly
    // request the hash for password comparison.
    const user = await User.findOne({
      username: username.trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        msg: "Invalid username or password.",
      });
    }

    const passwordMatches = await user.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        msg: "Invalid username or password.",
      });
    }

    const token = user.generateToken();

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      msg: "Login successful.",
      token,
      userId: user._id.toString(),
      userData: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      msg: "Unable to log in. Please try again.",
    });
  }
};

// ---------------- GET CURRENT USER ----------------

const user = async (req, res) => {
  try {
    // req.user is populated by your auth middleware.
    if (!req.user) {
      return res.status(401).json({
        msg: "Authentication required.",
      });
    }

    return res.status(200).json({
      userData: sanitizeUser(req.user),
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      msg: "Unable to retrieve user.",
    });
  }
};

// ---------------- UPDATE USER ----------------

const updateUserById = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Only allow ordinary profile fields to be updated here.
    // Password changes should use a dedicated password flow.
    const allowedFields = [
      "firstname",
      "lastname",
      "email",
      "phone",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Prevent users from updating another account's profile.
    if (
      !req.user ||
      (req.user._id?.toString() !== id &&
        req.user.userId?.toString() !== id &&
        req.user.isAdmin !== true)
    ) {
      return res.status(403).json({
        msg: "You are not allowed to update this user.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        msg: "User not found.",
      });
    }

    return res.status(200).json({
      msg: "Profile updated successfully.",
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    return next(error);
  }
};

// ---------------- LOGOUT ----------------

const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    msg: "Logout successful.",
  });
};

module.exports = {
  home,
  signUp,
  login,
  user,
  updateUserById,
  logout,
};

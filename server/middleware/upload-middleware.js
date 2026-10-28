const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Resolve to server/uploads (one level above /middleware)
const uploadPath =
  process.env.UPLOAD_PATH || path.join(__dirname, "..", "uploads");

// Make sure the folder exists
fs.mkdirSync(uploadPath, { recursive: true });

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
  }
};

// Turn upload errors into a clear JSON response instead of a 500
const handleUpload = (middleware) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
    next();
  });
};

// Single file upload
const uploadSingle = handleUpload(
  multer({ storage, fileFilter }).single("img")
);

// Multiple file uploads
const uploadMultiple = handleUpload(
  multer({ storage, fileFilter }).fields([
    { name: "img", maxCount: 1 },
    { name: "colorImages", maxCount: 20 },
  ])
);

module.exports = {
  uploadSingle,
  uploadMultiple,
};
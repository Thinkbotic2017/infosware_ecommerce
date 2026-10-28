require("dotenv").config();

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const sharp = require("sharp");
const ProductPage = require("./models/productPage-model");
const { Category } = require("./models/landingpage-model");

const uploadsDir = path.join(__dirname, "uploads");
const publicDir = path.resolve(__dirname, "..", "frontend", "public");
const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const publicProductImages = [
  "product-1.jpg",
  "product-2.jpg",
  "resize-17803015281917499649product2.jpg",
  "sports-1.jpg",
];

const getHash = (buffer) =>
  crypto.createHash("sha256").update(buffer).digest("hex");

const isProductImage = async (filePath) => {
  const metadata = await sharp(filePath).metadata();
  const aspectRatio = metadata.width / metadata.height;

  return (
    metadata.width >= 250 &&
    metadata.height >= 250 &&
    aspectRatio >= 0.5 &&
    aspectRatio <= 2
  );
};

const discoverUploadImages = async () => {
  const candidates = [];

  for (const filename of fs.readdirSync(uploadsDir).sort()) {
    if (!allowedImageExtensions.has(path.extname(filename).toLowerCase())) {
      continue;
    }

    const filePath = path.join(uploadsDir, filename);

    try {
      if (await isProductImage(filePath)) {
        const buffer = fs.readFileSync(filePath);
        candidates.push({
          filename,
          filePath,
          hash: getHash(buffer),
        });
      }
    } catch (error) {
      console.warn(`Skipping unreadable upload "${filename}": ${error.message}`);
    }
  }

  return candidates;
};

const addPublicProductImages = (candidates) => {
  const knownHashes = new Set(candidates.map(({ hash }) => hash));

  for (const filename of publicProductImages) {
    const sourcePath = path.join(publicDir, filename);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Expected local product image was not found: ${sourcePath}`);
    }

    const buffer = fs.readFileSync(sourcePath);
    const hash = getHash(buffer);

    if (knownHashes.has(hash)) {
      continue;
    }

    const extension = path.extname(filename);
    const destinationName = `local-catalog-${path.basename(filename, extension)}-${hash.slice(0, 8)}${extension}`;
    const destinationPath = path.join(uploadsDir, destinationName);

    if (fs.existsSync(destinationPath)) {
      if (getHash(fs.readFileSync(destinationPath)) !== hash) {
        throw new Error(`Refusing to overwrite a different image: ${destinationPath}`);
      }
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }

    candidates.push({
      filename: destinationName,
      filePath: destinationPath,
      hash,
    });
    knownHashes.add(hash);
  }
};

const makeProductPlaceholder = (candidate, index) => ({
  name: `Local Catalog Item ${String(index + 1).padStart(2, "0")} (details pending)`,
  isPlaceholder: true,
  catalogStatus: "draft",
  priceVerified: false,
  placeholderKey: candidate.hash,
  Brand: "Details pending",
  img: `uploads/${candidate.filename}`,
  descriptions: "Temporary local preview. Product details, price, and stock need confirmation.",
  category: "Local Catalog",
  subCategory: "Details pending",
  price: 0,
  oldPrice: 0,
  discount: 0,
  gst: 0,
  stock: 0,
  stockStatus: "out-of-stock",
  rating: 0,
  ratingCount: 0,
  ratingTotal: 0,
  productDescription: "Placeholder listing generated from a surviving local image.",
  images: [],
});

const seed = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Configure server/.env before seeding.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const candidates = await discoverUploadImages();
  addPublicProductImages(candidates);

  const uniqueCandidates = [];
  const seenHashes = new Set();

  for (const candidate of candidates) {
    if (seenHashes.has(candidate.hash)) {
      continue;
    }
    seenHashes.add(candidate.hash);
    uniqueCandidates.push(candidate);
  }

  let insertedProducts = 0;
  let skippedProducts = 0;

  for (const [index, candidate] of uniqueCandidates.entries()) {
    const imagePath = `uploads/${candidate.filename}`;
    const existing = await ProductPage.findOne({
      $or: [{ img: imagePath }, { placeholderKey: candidate.hash }],
    }).select("_id isPlaceholder name price category stock stockStatus");

    if (existing) {
      skippedProducts += 1;
      continue;
    }

    await ProductPage.create(makeProductPlaceholder(candidate, index));
    insertedProducts += 1;
  }

  let insertedCategory = false;
  const existingCategory = await Category.findOne({ category: "Local Catalog" }).select("_id");

  if (!existingCategory && uniqueCandidates[0]) {
    await Category.create({
      category: "Local Catalog",
      img: `uploads/${uniqueCandidates[0].filename}`,
    });
    insertedCategory = true;
  }

  console.log(
    JSON.stringify(
      {
        uniqueImagesFound: uniqueCandidates.length,
        productsInserted: insertedProducts,
        productsSkippedAlreadyPresent: skippedProducts,
        categoryInserted: insertedCategory,
        category: "Local Catalog",
        note: "All generated listings are unpublished, zero-price, out-of-stock drafts; enter verified details before publishing.",
      },
      null,
      2
    )
  );
};

seed()
  .catch((error) => {
    console.error("Local catalog seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

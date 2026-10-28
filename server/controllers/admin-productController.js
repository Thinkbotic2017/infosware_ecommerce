const ProductPage = require("../models/productPage-model");
const ProductInquiry = require("../models/ProductInquiry-model");
// If you use the ProductDetails routes, add your model import here, for example:
// const ProductDetails = require("../models/productDetails-model");

function safeParse(str) {
    try {
        return JSON.parse(str);
    } catch {
        return [];
    }
}

// Existing images arrive as one JSON array per color, in the same order as colorNames
function parseExistingByColor(raw, colorNames) {
    const map = {};
    if (!raw) return map;
    const list = Array.isArray(raw) ? raw : [raw];

    list.forEach((item, i) => {
        let parsed = item;
        if (typeof item === "string") {
            try {
                parsed = JSON.parse(item);
            } catch {
                parsed = [];
            }
        }

        if (Array.isArray(parsed)) {
            const color = colorNames[i];
            if (color === undefined) return;
            map[color] = [...(map[color] || []), ...parsed.filter((x) => typeof x === "string")];
        } else if (parsed && parsed.color && parsed.image) {
            map[parsed.color] = [...(map[parsed.color] || []), parsed.image];
        }
    });

    return map;
}

// Builds [{ imageColor, imageSet }] from the form data (used by create and update)
function buildColorImages(req) {
    if (!req.body.colorNames) return [];

    const colorNames = (Array.isArray(req.body.colorNames)
        ? req.body.colorNames
        : [req.body.colorNames]
    ).map((c) => String(c).trim());

    const files = req.files?.colorImages || [];

    let counts = Array(colorNames.length).fill(0);
    if (req.body.colorImageCounts) {
        try {
            counts = JSON.parse(req.body.colorImageCounts);
        } catch {
            counts = Array(colorNames.length).fill(0);
        }
    }

    const existingMap = parseExistingByColor(req.body.existingColorImages, colorNames);

    let imgIdx = 0;
    return colorNames.map((color, i) => {
        const count = Number(counts[i]) || 0;
        const imageSet = [...(existingMap[color] || [])];

        files.slice(imgIdx, imgIdx + count).forEach((file) => {
            imageSet.push(`uploads/${file.filename}`);
        });
        imgIdx += count;

        return { imageColor: color, imageSet };
    });
}

/* ──────────────────────────────────────────────
   Product Details
────────────────────────────────────────────── */
const getAllProductDetails = async (req, res, next) => {
    try {
        const data = await ProductDetails.find({});
        if (!data || data.length === 0) {
            return res.status(404).json({ msg: "No product details found" });
        }
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const getProductDetailsById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await ProductDetails.findById(id);
        if (!data) {
            return res.status(404).json({ msg: "Product details not found" });
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json({ msg: "Error fetching product details", error: error.message });
    }
};

const createProductDetails = async (req, res, next) => {
    try {
        const newData = new ProductDetails(req.body);
        await newData.save();
        return res.status(201).json({ msg: "Product details created successfully", data: newData });
    } catch (error) {
        next(error);
    }
};

const updateProductDetailsById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedData = await ProductDetails.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedData) {
            return res.status(404).json({ msg: "Product details not found" });
        }
        return res.status(200).json({ msg: "Product details updated successfully", data: updatedData });
    } catch (error) {
        return res.status(400).json({ msg: "Error updating product details", error: error.message });
    }
};

const deleteProductDetailsById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ProductDetails.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ msg: "Product details not found" });
        }
        return res.status(200).json({ msg: "Product details deleted successfully" });
    } catch (error) {
        next(error);
    }
};

/* ──────────────────────────────────────────────
   Product Inquiry
────────────────────────────────────────────── */
const getProductInquiry = async (req, res, next) => {
    try {
        const data = await ProductInquiry.find({});
        // Always return 200, even if no data
        return res.status(200).json(data);
    } catch (error) {
        next(error);
    }
};

const getProductInquiryCount = async (req, res, next) => {
    try {
        const count = await ProductInquiry.countDocuments();
        return res.status(200).json({ count });
    } catch (error) {
        next(error);
    }
};

const deleteProductInquiry = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ProductInquiry.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ msg: "Inquiry not found" });
        }
        return res.status(200).json({ msg: "Inquiry deleted successfully" });
    } catch (error) {
        next(error);
    }
};

/* ──────────────────────────────────────────────
   Product Pages
────────────────────────────────────────────── */
const getAllProductPages = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const data = await ProductPage.find({})
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalDocuments = await ProductPage.countDocuments();
        const totalPages = Math.ceil(totalDocuments / limit);

        if (!data || data.length === 0) {
            return res.status(404).json({ msg: "No product pages found" });
        }
        return res.status(200).json({ data, totalPages, currentPage: page, totalDocuments });
    } catch (error) {
        next(error);
    }
};

const getProductPageById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = await ProductPage.findById(id);
        if (!data) {
            return res.status(404).json({ msg: "Product page not found" });
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(400).json({ msg: "Error fetching product page", error: error.message });
    }
};

const createProductPage = async (req, res, next) => {
    try {
        // ── TRIM STRINGS
        const name            = req.body.name?.trim();
        const Brand           = req.body.Brand?.trim();
        const descriptions    = req.body.descriptions?.trim();
        const category        = req.body.category?.trim();
        const subCategory     = req.body.subCategory?.trim();
        const metaTitle       = req.body.metaTitle?.trim();
        const metaDescription = req.body.metaDescription?.trim();
        const metaKeywords    = req.body.metaKeywords?.trim();

        // ── SAFE NUMBER CONVERSION
        const price    = req.body.price    !== undefined && req.body.price    !== "" ? Number(req.body.price)    : undefined;
        const oldPrice = req.body.oldPrice !== undefined && req.body.oldPrice !== "" ? Number(req.body.oldPrice) : 0;
        const discount = req.body.discount !== undefined && req.body.discount !== "" ? Number(req.body.discount) : 0;
        const gst      = req.body.gst      !== undefined && req.body.gst      !== "" ? Number(req.body.gst)      : 0;
        const stock    = req.body.stock    !== undefined && req.body.stock    !== "" ? Number(req.body.stock)    : 50;
        // rating is set by users via reviews, never from the admin form
        const rating   = 0;

        // ── REQUIRED VALIDATION
        if (!name || !category || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Name, category and price are required",
            });
        }

        if (isNaN(price) || isNaN(oldPrice) || isNaN(discount) || isNaN(gst) || isNaN(stock)) {
            return res.status(400).json({
                success: false,
                message: "Invalid numeric value in price, old price, discount, GST, or stock",
            });
        }

        if (name.length < 2) {
            return res.status(400).json({ success: false, message: "Product name too short" });
        }
        if (price <= 0) {
            return res.status(400).json({ success: false, message: "Selling price must be greater than zero" });
        }
        if (oldPrice < 0) {
            return res.status(400).json({ success: false, message: "Old price cannot be negative" });
        }
        if (discount < 0 || discount > 100) {
            return res.status(400).json({ success: false, message: "Discount must be between 0 and 100" });
        }
        if (gst < 0 || gst > 100) {
            return res.status(400).json({ success: false, message: "GST must be between 0 and 100" });
        }
        if (stock < 0) {
            return res.status(400).json({ success: false, message: "Stock cannot be negative" });
        }

        // ── IMAGES (no size / dimension limits)
        const hasColorImages = Boolean(req.body.colorNames && req.files?.colorImages?.length);

        if (
            !req.files?.img?.[0] &&
            !req.body.imgPath &&
            !req.body.existingImg &&
            !hasColorImages
        ) {
            return res.status(400).json({
                success: false,
                message: "Main image is required",
            });
        }

        // ── PREPARE DATA
        const newData = {
            name,
            Brand,
            descriptions,
            category,
            subCategory,
            price,
            oldPrice,
            discount,
            gst,
            stock,
            rating,
            metaTitle,
            metaDescription,
            metaKeywords,
            priceAlert:         req.body.priceAlert || "",
            stockStatus:        stock === 0 ? "out-of-stock" : stock < 5 ? "few-left" : "in-stock",
            catalogStatus:      "published",
            isPlaceholder:      false,
            priceVerified:      true,
            productDescription: req.body.productDescription || "",
            specifications:     safeParse(req.body.specifications || "[]"),
            warranty:           safeParse(req.body.warranty || "[]"),
            otherinfo:          safeParse(req.body.otherinfo || "[]"),
            offers:             safeParse(req.body.offers || "[]"),
            otherinfoText:      req.body.otherinfoText || "",
            // reviews and quesAns are managed by users, never set from the admin form
            reviews: [],
            quesAns: [],
        };

        // ── MAIN IMAGE PATH
        if (req.files?.img?.[0]) {
            newData.img = `uploads/${req.files.img[0].filename}`;
        } else if (req.body.imgPath) {
            newData.img = req.body.imgPath;
        } else if (req.body.existingImg) {
            newData.img = req.body.existingImg;
        }

        // ── COLOR IMAGES
        const images = buildColorImages(req);
        newData.images = images;

        // Colour-wise product with no main image: use the first colour image
        if (!newData.img) {
            const first = images.find((c) => c.imageSet.length)?.imageSet[0];
            if (first) newData.img = first;
        }

        // ── CREATE
        const createdData = new ProductPage(newData);
        await createdData.save();

        return res.status(201).json({
            success: true,
            message: "Product page created successfully",
            data: createdData,
        });
    } catch (error) {
        console.error("Error creating product page:", error);

        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((e) => e.message);
            return res.status(400).json({ success: false, message: errors[0] });
        }

        return res.status(500).json({
            success: false,
            message: "Error creating product page",
            error: error.message,
        });
    }
};

const updateProductPageById = async (req, res, next) => {
    try {
        const { id } = req.params;
        let updateData = {};

        // Copy all simple fields from req.body
        const allowedFields = [
            "name", "Brand", "priceAlert", "descriptions", "category", "subCategory",
            "price", "oldPrice", "discount", "gst", "metaTitle", "metaDescription", "metaKeywords",
            "productDescription", "specifications", "warranty", "quesAns", "otherinfo",
            "offers", "otherinfoText",
        ];
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                // Parse arrays/objects if needed
                if (["specifications", "warranty", "quesAns", "otherinfo", "offers"].includes(field)) {
                    updateData[field] = safeParse(req.body[field]);
                } else {
                    updateData[field] = req.body[field];
                }
            }
        });

        // Main image
        if (req.files && req.files.img && req.files.img[0]) {
            updateData.img = `uploads/${req.files.img[0].filename}`;
        } else if (req.body.imgPath && !req.files?.img) {
            updateData.img = req.body.imgPath;
        }

        // Color-wise images
        let images = [];
        if (req.body.colorNames) {
            images = buildColorImages(req);
        } else if (req.body.images) {
            if (typeof req.body.images === "string") {
                try {
                    images = JSON.parse(req.body.images);
                } catch {
                    images = [];
                }
            } else if (Array.isArray(req.body.images)) {
                images = req.body.images;
            }
        }

        updateData.images = images;

        // ---- Handle stock status ----
        if (req.body.stock !== undefined) {
            updateData.stock = Number(req.body.stock);
            if (updateData.stock === 0) {
                updateData.stockStatus = "out-of-stock";
            } else if (updateData.stock < 5) {
                updateData.stockStatus = "few-left";
            } else {
                updateData.stockStatus = "in-stock";
            }
        }

        const productName = String(req.body.name || "").trim();
        const productCategory = String(req.body.category || "").trim();
        const productPrice = Number(req.body.price);
        const hasVerifiedListingData =
            productName.length > 0 &&
            !productName.toLowerCase().includes("(details pending)") &&
            productCategory.length > 0 &&
            productCategory.toLowerCase() !== "local catalog" &&
            Number.isFinite(productPrice) &&
            productPrice > 0 &&
            req.body.stock !== undefined &&
            String(req.body.stock).trim() !== "";

        if (hasVerifiedListingData) {
            updateData.isPlaceholder = false;
            updateData.placeholderKey = "";
            updateData.priceVerified = true;
            updateData.catalogStatus = "published";
        }

        // ---- Update product ----
        const updatedData = await ProductPage.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!updatedData) {
            return res.status(404).json({ msg: "Product page not found" });
        }

        return res
            .status(200)
            .json({ msg: "Product page updated successfully", data: updatedData });
    } catch (error) {
        return res
            .status(400)
            .json({ msg: "Error updating product page", error: error.message });
    }
};

const deleteProductPageById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await ProductPage.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ msg: "Product page not found" });
        }
        return res.status(200).json({ msg: "Product page deleted successfully" });
    } catch (error) {
        next(error);
    }
};

/* ──────────────────────────────────────────────
   Questions & Answers
────────────────────────────────────────────── */
// User submits a question (no answer yet)
const addProductQuestion = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { question } = req.body;
        const userId = req.user._id; // from auth middleware

        if (!question) return res.status(400).json({ msg: "Question is required" });

        const product = await ProductPage.findById(productId);
        if (!product) return res.status(404).json({ msg: "Product not found" });

        product.quesAns.push({ userId, key: question, value: "" });
        await product.save();

        res.status(201).json({ msg: "Question submitted", quesAns: product.quesAns });
    } catch (error) {
        next(error);
    }
};

// Admin answers a question
const answerProductQuestion = async (req, res, next) => {
    try {
        const { productId, qaId } = req.params;
        const { answer } = req.body;

        const product = await ProductPage.findById(productId);
        if (!product) return res.status(404).json({ msg: "Product not found" });

        const qa = product.quesAns.id(qaId);
        if (!qa) return res.status(404).json({ msg: "Q&A not found" });

        qa.value = answer;
        await product.save();

        res.status(200).json({ msg: "Answer added", quesAns: product.quesAns });
    } catch (error) {
        next(error);
    }
};

// Get unanswered questions
const getPendingQuestion = async (req, res) => {
    try {
        const products = await ProductPage.find({}).select("name category img quesAns");

        const formattedProducts = products
            .map((product) => ({
                ...product._doc,
                quesAns: Array.isArray(product.quesAns)
                    ? product.quesAns.filter((qa) => !qa.value || qa.value.trim() === "")
                    : [],
            }))
            .filter((product) => product.quesAns.length > 0);

        return res.status(200).json({
            success: true,
            data: formattedProducts,
        });
    } catch (err) {
        console.log("Pending Question Error:", err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

/* ──────────────────────────────────────────────
   Delete a product image
────────────────────────────────────────────── */
const deleteProductImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const imageUrl = req.body.imageUrl || req.query.imageUrl;

        console.log("Delete image called for product:", id, "imageUrl:", imageUrl);

        if (!imageUrl) {
            return res.status(400).json({ msg: "Image URL is required" });
        }

        const product = await ProductPage.findById(id);
        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        console.log("Product images before:", product.images);

        const decodedUrl = decodeURIComponent(imageUrl);

        // Remove image by strict match
        const newImages = (product.images || []).filter((img) => img !== decodedUrl);
        if (newImages.length === product.images.length) {
            return res.status(404).json({ msg: "Image not found in product images" });
        }
        product.images = newImages;

        await product.save();

        console.log("Product images after:", product.images);

        return res.status(200).json({ msg: "Image deleted", images: product.images });
    } catch (error) {
        console.error("Delete image error:", error);
        return res.status(500).json({ msg: "Error deleting image", error: error.message });
    }
};

module.exports = {
    getAllProductDetails,
    getProductDetailsById,
    createProductDetails,
    updateProductDetailsById,
    deleteProductDetailsById,
    getAllProductPages,
    getProductPageById,
    createProductPage,
    updateProductPageById,
    deleteProductPageById,
    getProductInquiry,
    deleteProductInquiry,
    getProductInquiryCount,
    addProductQuestion,
    answerProductQuestion,
    getPendingQuestion,
    deleteProductImage,
};
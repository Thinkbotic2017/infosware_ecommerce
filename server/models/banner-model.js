const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["main", "side1", "side2", "trbanner"],
      required: [true, "Banner type is required"],
    },

    title: {
      type: String,
      required: [true, "Banner title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
      validate: {
        validator: function (value) {
          return value.trim().length > 0;
        },
        message: "Title cannot contain only spaces",
      },
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: [150, "Subtitle cannot exceed 150 characters"],
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description too long"],
      default: "",
    },

    buttonText: {
      type: String,
      trim: true,
      maxlength: [30, "Button text too long"],
      default: "Shop Now",
    },

    buttonLink: {
      type: String,
      trim: true,
      default: "/products",
      validate: {
        validator: function (value) {
          // empty is allowed; otherwise must start with "/" or http(s)://
          return !value || /^\/|^https?:\/\//.test(value);
        },
        message: "Invalid button link",
      },
    },

    img: {
      type: String,
      required: [true, "Banner image is required"],
      trim: true,
    },

    priceText: {
      type: String,
      trim: true,
      maxlength: [50, "Price text too long"],
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    category: {
      type: String,
      default: "",
    },

    subcategory: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Banners", bannerSchema);
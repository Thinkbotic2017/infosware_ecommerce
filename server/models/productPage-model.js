
const mongoose =
require("mongoose");

const productPageSchema =
new mongoose.Schema({

  name: {

    type: String,

    required: [
      true,
      "Product name is required",
    ],

    trim: true,

    minlength: [
      2,
      "Product name too short",
    ],

    maxlength: [
      200,
      "Product name too long",
    ],
  },

  isPlaceholder: {
    type: Boolean,
    default: false,
  },

  catalogStatus: {
    type: String,
    enum: ["draft", "published"],
    default: "published",
  },

  estimatedPriceMin: {
    type: Number,
    min: 0,
    default: null,
  },

  estimatedPriceMax: {
    type: Number,
    min: 0,
    default: null,
  },

  estimateNote: {
    type: String,
    trim: true,
    default: "",
  },

  priceVerified: {
    type: Boolean,
    default: false,
  },

  placeholderKey: {
    type: String,
    trim: true,
    default: "",
  },

  Brand: {

    type: String,

    trim: true,

    default: "",
  },

  img: {

    type: String,

    required: [
      true,
      "Main image is required",
    ],

    trim: true,
  },

  images: [

    {

      imageColor: {

        type: String,

        trim: true,

        default: "",
      },

      imageSet: [

        {
          type: String,

          trim: true,
        },
      ],
    },
  ],

  descriptions: {

    type: String,

    trim: true,

    default: "",
  },

  category: {

    type: String,

    required: [
      true,
      "Category is required",
    ],

    trim: true,
  },

  subCategory: {

    type: String,

    trim: true,

    default: "",
  },

  price: {

    type: Number,

    required: [
      true,
      "Price is required",
    ],

    min: [
      0,
      "Price cannot be negative",
    ],
  },

  priceAlert: {

    type: String,

    trim: true,

    default: "",
  },

  oldPrice: {

    type: Number,

    min: [
      0,
      "Old price cannot be negative",
    ],

    default: 0,
  },

  discount: {

    type: Number,

    min: [
      0,
      "Discount cannot be negative",
    ],

    max: [
      100,
      "Discount cannot exceed 100%",
    ],

    default: 0,
  },

  gst: {

    type: Number,

    min: [
      0,
      "GST cannot be negative",
    ],

    max: [
      100,
      "GST cannot exceed 100%",
    ],

    default: 0,
  },

  stock: {

    type: Number,

    min: [
      0,
      "Stock cannot be negative",
    ],

    default: 0,
  },

  stockStatus: {

    type: String,

    enum: [

      "in-stock",

      "out-of-stock",

      "few-left",
    ],

    default: "in-stock",
  },

  rating: {

    type: Number,

    min: 0,

    max: 5,

    default: 0,
  },

  ratingCount: {

    type: Number,

    min: 0,

    default: 0,
  },

  ratingTotal: {

    type: Number,

    min: 0,

    default: 0,
  },

  productDescription: {

    type: String,

    trim: true,

    default: "",
  },

  specifications: [

    {

      key: {

        type: String,

        trim: true,

        default: "",
      },

      value: {

        type: String,

        trim: true,

        default: "",
      },
    },
  ],

  warranty: [

    {

      key: {

        type: String,

        trim: true,

        default: "",
      },

      value: {

        type: String,

        trim: true,

        default: "",
      },
    },
  ],

  reviews: [

    {

      userId: {

        type:
mongoose.Schema.Types.ObjectId,

        ref: "User",
      },

      rating: {

        type: Number,

        min: 1,

        max: 5,

        required: true,
      },

      key: {

        type: String,

        trim: true,

        default: "",
      },

      value: {

        type: String,

        trim: true,

        default: "",
      },
    },
  ],

  quesAns: [

    {

      userId: {

        type:
mongoose.Schema.Types.ObjectId,

        ref: "User",
      },

      key: {

        type: String,

        trim: true,

        default: "",
      },

      value: {

        type: String,

        trim: true,

        default: "",
      },
    },
  ],

  otherinfo: [

    {

      key: {

        type: String,

        trim: true,

        default: "",
      },

      value: {

        type: String,

        trim: true,

        default: "",
      },
    },
  ],

  offers: [

    {

      key: {

        type: String,

        trim: true,

        default: "",
      },

      value: {

        type: String,

        trim: true,

        default: "",
      },
    },
  ],

  otherinfoText: {

    type: String,

    trim: true,

    default: "",
  },

  metaTitle: {

    type: String,

    trim: true,

    maxlength: 60,

    default: "",
  },

  metaDescription: {

    type: String,

    trim: true,

    maxlength: 160,

    default: "",
  },

  metaKeywords: {

    type: String,

    trim: true,

    default: "",
  },

},

{
  timestamps: true,
});

module.exports =
mongoose.model(
  "ProductPage",
  productPageSchema
);


const mongoose =
require("mongoose");

// COUNTER SCHEMA

const counterSchema =
new mongoose.Schema({

  _id: String,

  seq: {

    type: Number,

    default: 0,
  },
});

const Counter =
mongoose.model(
  "Counter",
  counterSchema
);

// MAIN SCHEMA

const ProductInquirySchema =
new mongoose.Schema({

  enquiryNumber: {

    type: Number,

    unique: true,
  },

  name: {

    type: String,

    required: [
      true,
      "Name is required",
    ],

    trim: true,

    minlength: [

      2,

      "Name must be at least 2 characters",
    ],

    maxlength: [

      50,

      "Name cannot exceed 50 characters",
    ],

    match: [

      /^[A-Za-z ]+$/,

      "Name should contain only letters",
    ],

    validate: {

      validator: function (value) {

        return value.trim().length > 0;
      },

      message:
        "Name cannot contain only spaces",
    },
  },

  email: {

    type: String,

    required: [
      true,
      "Email is required",
    ],

    trim: true,

    lowercase: true,

    match: [

      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

      "Invalid email address",
    ],
  },

  mobile: {

    type: String,

    required: [
      true,
      "Mobile number is required",
    ],

    trim: true,

    match: [

      /^[0-9]{10}$/,

      "Mobile number must be 10 digits",
    ],
  },

  altMobile: {

    type: String,

    trim: true,

    default: "",

    match: [

      /^$|^[0-9]{10}$/,

      "Alternate mobile must be 10 digits",
    ],
  },

  quantity: {

    type: Number,

    required: [
      true,
      "Quantity is required",
    ],

    min: [

      1,

      "Quantity must be at least 1",
    ],

    max: [

      100000,

      "Quantity too large",
    ],
  },

  description: {

    type: String,

    trim: true,

    maxlength: [

      1000,

      "Description too long",
    ],

    default: "",
  },

  submittedAt: {

    type: Date,

    default: Date.now,
  },

  isBulkOrder: {

    type: Boolean,

    default: false,
  },

  isCustomization: {

    type: Boolean,

    default: false,
  },

},

{
  timestamps: true,
});

// AUTO ENQUIRY NUMBER

ProductInquirySchema.pre(

"save",

async function (next) {

  if (this.isNew) {

    const counter =

await Counter.findByIdAndUpdate(

      { _id: "ProductInquiry" },

      { $inc: { seq: 1 } },

      {

        new: true,

        upsert: true,
      }
    );

    this.enquiryNumber =
counter.seq;
  }

  next();
});

module.exports =
mongoose.model(
  "ProductInquiry",
  ProductInquirySchema
);


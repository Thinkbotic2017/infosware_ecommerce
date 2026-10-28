
const mongoose =
require("mongoose");

const addressSchema =
new mongoose.Schema({

  userId: {

    type:
mongoose.Schema.Types.ObjectId,

    ref: "User",

    required: true,
  },

  fullName: {

    type: String,

    required: [
      true,
      "Full name is required",
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
  },

  businessName: {

    type: String,

    trim: true,

    default: "",
  },

  gst: {

    type: String,

    trim: true,

    uppercase: true,

    default: "",

    match: [

      /^$|^[0-9A-Z]{15}$/,

      "Invalid GST number",
    ],
  },

  address: {

    type: String,

    required: [
      true,
      "Address is required",
    ],

    trim: true,

    minlength: [
      5,
      "Address too short",
    ],

    maxlength: [
      200,
      "Address too long",
    ],
  },

  street: {

    type: String,

    required: [
      true,
      "Street is required",
    ],

    trim: true,

    minlength: [
      2,
      "Street too short",
    ],
  },

  landmark: {

    type: String,

    trim: true,

    default: "",
  },

  city: {

    type: String,

    required: [
      true,
      "City is required",
    ],

    trim: true,

    match: [

      /^[A-Za-z ]+$/,

      "Invalid city name",
    ],
  },

  state: {

    type: String,

    required: [
      true,
      "State is required",
    ],

    trim: true,

    match: [

      /^[A-Za-z ]+$/,

      "Invalid state name",
    ],
  },

  zipCode: {

    type: String,

    required: [
      true,
      "Zip code is required",
    ],

    trim: true,

    match: [

      /^[0-9]{6}$/,

      "Zip code must be 6 digits",
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

  type: {

    type: String,

    enum: [

      "Home",

      "Office",

      "Shipping",

      "Billing",
    ],

    required: true,
  },

},

{
  timestamps: true,
});

module.exports =
mongoose.model(
  "userAddress",
  addressSchema
);


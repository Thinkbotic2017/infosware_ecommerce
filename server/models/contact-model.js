
const mongoose =
require("mongoose");

const contactSchema =
new mongoose.Schema({
name: {

    type: String,

    required: [
      true,
      "Name is required"
    ],

    trim: true,

    minlength: [
      2,
      "Name must be at least 2 characters"
    ],

    maxlength: [
      50,
      "Name cannot exceed 50 characters"
    ],
  },

  email: {

    type: String,

    required: [
      true,
      "Email is required"
    ],

    trim: true,

    lowercase: true,

    match: [

      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

      "Please enter a valid email",
    ],
  },

  phone: {

    type: String,

    required: [
      true,
      "Phone number is required"
    ],

    trim: true,

    match: [

      /^[0-9]{10}$/,

      "Phone number must be 12 digits",
    ],
  },

  description: {

    type: String,

    required: [
      true,
      "Description is required"
    ],

    trim: true,

    minlength: [
      5,
      "Description must be at least 5 characters"
    ],

    maxlength: [
      500,
      "Description cannot exceed 500 characters"
    ],
  },

  status: {

    type: String,

    enum: [
      "PENDING",
      "RESOLVED"
    ],

    default: "PENDING",
  },

},

{
  timestamps: true,
});

module.exports =
mongoose.model(
  "Contact",
  contactSchema
);


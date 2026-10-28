const mongoose =
require("mongoose");

const footerSchema =
new mongoose.Schema({

  companyDescription: {
    type: String,
  },

  address: {
    type: String,
  },

  phone: {
    type: String,
  },

  email: {
    type: String,
  },

  copyright: {
    type: String,
  },

  quickLinks: [
    {
      label: String,
      link: String,
    }
  ],

  socials: [

    {
      platform: String,

      link: String,
    }

  ],

}, {
  timestamps: true,
});

module.exports =
mongoose.model(
  "Footertwo",
  footerSchema
);
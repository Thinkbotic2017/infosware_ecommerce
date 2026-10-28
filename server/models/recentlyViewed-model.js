const mongoose = require("mongoose");

const recentlyViewedSchema = new mongoose.Schema({

  userId: {

    type:
      mongoose.Schema.Types.ObjectId,

    ref: "User",

    required: true,

  },

  products: [

    {

      productId: {

        type:
          mongoose.Schema.Types.ObjectId,

        ref: "ProductPage",

      },

      viewedAt: {

        type: Date,

        default: Date.now,

      },

    }

  ],

}, {
  timestamps: true,
});

module.exports =
mongoose.model(

  "RecentlyViewed",

  recentlyViewedSchema
);
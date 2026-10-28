const RecentlyViewed =
require("../models/recentlyViewed-model");

const ProductPage =
require("../models/productPage-model");

// ADD RECENTLY VIEWED PRODUCT

exports.addRecentlyViewed =
async (req, res) => {

  try {

    const userId =
      req.user._id;

    const {
      productId,
    } = req.body;

    // CHECK PRODUCT EXISTS

    const product =
      await ProductPage.findById(
        productId
      );

    if (!product) {

      return res.status(404).json({

        success: false,

        message:
          "Product not found",

      });
    }

    // FIND USER VIEWED

    let viewed =
      await RecentlyViewed.findOne({

        userId,
      });

    // CREATE NEW

    if (!viewed) {

      viewed =
        new RecentlyViewed({

          userId,

          products: [],
        });
    }

    // REMOVE DUPLICATE

 viewed.products = viewed.products.filter(
  (item) =>
    item &&
    item.productId &&
    item.productId.toString() !== productId.toString()
);
    // ADD LATEST PRODUCT

   viewed.products.unshift({
  productId: productId,
});

    // LIMIT TO 10

    viewed.products =
      viewed.products.slice(0, 10);

    await viewed.save();

    res.status(200).json({

      success: true,

      message:
        "Recently viewed updated",

      data: viewed,

    });

  } catch (error) {

    console.log(
      "Add Recently Viewed Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        error.message,

    });
  }
};

// GET RECENTLY VIEWED PRODUCTS

exports.getRecentlyViewed =
async (req, res) => {

  try {

    const viewed =
      await RecentlyViewed

        .findOne({

          userId:
            req.user._id,

        })

        .populate({

          path:
            "products.productId",

          model:
            "ProductPage",
        });

    // NO PRODUCTS

    if (!viewed) {

      return res.status(200).json({

        success: true,

        data: [],
      });
    }

    // REMOVE NULL PRODUCTS

    const products =
      viewed.products

        .filter(
          (item) =>
            item.productId
        )

        .map(
          (item) =>
            item.productId
        );

    res.status(200).json({

      success: true,

      data: products,

    });

  } catch (error) {

    console.log(
      "Get Recently Viewed Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        error.message,

    });
  }
};
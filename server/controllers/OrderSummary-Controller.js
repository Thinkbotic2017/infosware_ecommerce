const Cart = require("../models/cart-model");
const CartConfig = require("../models/pricing-model");

const getOrderSummary = async (
  req,
  res
) => {

  try {

    const userId =
      req.user._id;

    const {
      couponCode
    } = req.query;

    const cart =
      await Cart.findOne({
        userId,
      });

    if (
      !cart ||
      cart.items.length === 0
    ) {

      return res.status(200).json({
        success: true,
        summary: {
          oldPriceTotal: 0,
          cartTotal: 0,
          productDiscount: 0,
          cartDiscount: 0,
          couponDiscount: 0,
          subtotal: 0,
          gstAmount: 0,
          deliveryFee: 0,
          total: 0,
        },
      });

    }

    const config =
      await CartConfig.findOne();

    const cartDiscountPercent =
      config?.cartDiscount || 0;

    const deliveryFeeAmount =
      config?.deliveryFee || 0;

    const minFreeDeliveryAmount =
      config?.minFreeDeliveryAmount || 0;

    const availableCoupons =
      config?.availableCoupons || [];

    const oldPriceTotal =
      cart.items.reduce(
        (sum, item) =>
          sum +
          (item.oldPrice || item.price) *
            item.quantity,
        0
      );

    const cartTotal =
      cart.items.reduce(
        (sum, item) =>
          sum +
          item.price *
            item.quantity,
        0
      );

    const productDiscount =
      oldPriceTotal -
      cartTotal;

    const cartDiscount =
      cartTotal *
      cartDiscountPercent /
      100;

    let couponDiscount = 0;
    let appliedCoupon = null;

    if (couponCode) {

      appliedCoupon =
        availableCoupons.find(
          (coupon) =>
            !coupon.hidden &&
            coupon.code
              .toLowerCase()
              .trim() ===
            couponCode
              .toLowerCase()
              .trim()
        );

      if (appliedCoupon) {

        couponDiscount =
          cartTotal *
          appliedCoupon.discount /
          100;

      }

    }

    const subtotal =
      cartTotal -
      cartDiscount -
      couponDiscount;

  // Average GST %

const avgGstPercent =
  cart.items.length > 0

    ? cart.items.reduce(
        (acc, item) =>
          acc + (item.gst || 0),
        0
      ) / cart.items.length

    : 0;

// GST Amount

const gstAmount =
  (subtotal *
    avgGstPercent) /
  100;

    const deliveryFee =
      subtotal >=
      minFreeDeliveryAmount
        ? 0
        : deliveryFeeAmount;

    const total =
      subtotal +
      gstAmount +
      deliveryFee;

    const round =
      (num) =>
        Number(
          num.toFixed(2)
        );

    return res.status(200).json({

      success: true,

      summary: {

        oldPriceTotal:
          round(
            oldPriceTotal
          ),

        cartTotal:
          round(
            cartTotal
          ),

        productDiscount:
          round(
            productDiscount
          ),

        cartDiscount:
          round(
            cartDiscount
          ),

        couponDiscount:
          round(
            couponDiscount
          ),

        subtotal:
          round(
            subtotal
          ),

        gstAmount:
          round(
            gstAmount
          ),
  avgGstPercent:
    round(avgGstPercent),

        deliveryFee:
          round(
            deliveryFee
          ),

        total:
          round(
            total
          ),
      },

      appliedCoupon,

    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({

      success: false,

      message:
        "Failed to calculate order summary",

    });

  }

};

module.exports = {
  getOrderSummary,
};
const landing = require("./landingpage-model");

module.exports = {
  User: require("./user-model"),
  Category: landing.Category,
  Banner: landing.Banner,
  TRBanner: landing.TRBanner,
  Cards: landing.Cards,
  Product: require("./productPage-model"),
  ProductPage: require("./productPage-model"),
  Footer: require("./footer-model"),
};
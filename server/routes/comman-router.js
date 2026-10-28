const express = require('express');
const router = express.Router();
const commanGetController = require('../controllers/comman-getController');

// PAYMENT: public route so checkout can ask "is COD allowed?"
const { getPublicPaymentSettings } = require('../controllers/payment-admin-controller');

/*..............................
           landingpage-router
................................*/
router.route('/categories').get(commanGetController.getCategories);
router.route('/banners').get(commanGetController.getBanners);
router.route('/trbanner').get(commanGetController.getTRBanner);

/*..............................
           Navbar-router
................................*/
router.route('/navbar').get(commanGetController.getNavbar);

/*..............................
           Footer-router
................................*/
router.route('/footer').get(commanGetController.getFooter); 


/*..............................
           Product-router
................................*/
router.route('/products').get(commanGetController.getProductPage);


/*..............................
           ProductDetails-router
................................*/
router.route('/productdetails/:productId').get(commanGetController.getProductDetails);


/*..............................
           TopRated-router
................................*/
router.route('/toprated').get(commanGetController.getTopRatedProducts);

/*..............................
           Products-router
................................*/
router.route('/productCards').get(commanGetController.getProductCards); 

/*..............................
           Inquiry-router
................................*/
router.route('/inquiry').post(commanGetController.createInquiry); 

/*..............................
           Top Discounted Products-router
................................*/
//adding comment
router.route('/topdiscounted').get(commanGetController.getTopDiscountedProducts);

router.route('/filterproducts').get(commanGetController.getFilteredProducts)
router.route('/metaproducts').get(commanGetController.getProductsMeta);

/*..............................
           Payment settings-router (PAYMENT)
................................*/
router.route('/payment-settings').get(getPublicPaymentSettings);

module.exports = router;
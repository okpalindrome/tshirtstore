const express = require('express')
const router = express.Router()
const { isLoggedIn, customerRole } = require('../middlewares/user')
const { addProduct, 
    getAllProducts, 
    adminGetAllProducts, 
    getOneProduct, 
    adminUpdateOneProduct, 
    adminDeleteOneProduct,
    addReview,
    deleteReview,
    getOnlyReviewForOneProduct
} = require('../controllers/productController')

// user routes
router.route('/products').get(getAllProducts)
router.route('/product/reviews')
  .get(getOnlyReviewForOneProduct) // const productID = req.query
  .put(isLoggedIn, addReview) // const {rating, comment, productID} = req.body
  .delete(isLoggedIn, deleteReview) // const productID = req.query
router.route('/product/:id').get(getOneProduct) // routing with params must be de-prioritised in the sequence


// admin routes
router.route('/admin/product/add').post(isLoggedIn, customerRole("admin"), addProduct)
router.route('/admin/products').get(isLoggedIn, customerRole("admin"), adminGetAllProducts)
router.route('/admin/product/:id')
  .put(isLoggedIn, customerRole("admin"), adminUpdateOneProduct)
  .delete(isLoggedIn, customerRole("admin"), adminDeleteOneProduct)


module.exports = router
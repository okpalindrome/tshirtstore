const express = require('express')
const router = express.Router()
const { isLoggedIn, customerRole } = require('../middlewares/user')
const { addProduct, getAllProducts } = require('../controllers/productController')

//
router.route('/products').get(isLoggedIn, getAllProducts)

// admin
router.route('/admin/product/add').post(isLoggedIn, customerRole("admin"), addProduct)

module.exports = router
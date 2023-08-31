const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares/user')
const { createOrder } = require('../controllers/orderController')

router.route('/order/create').post(isLoggedIn, createOrder)

module.exports = router


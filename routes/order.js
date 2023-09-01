const express = require('express')
const router = express.Router()
const { isLoggedIn, customerRole } = require('../middlewares/user')
const { 
    createOrder, 
    getOneOrderDetails, 
    getMyOrders, 
    adminGetAllOrders,
    adminUpdateOrder,
    adminDeleteOrder } = require('../controllers/orderController')

router.route('/order/create').post(isLoggedIn, createOrder)
router.route('/myOrders').get(isLoggedIn, getMyOrders)
router.route('/order/:id').get(isLoggedIn, getOneOrderDetails)

// admin routes
router.route('/admin/allOrders').get(isLoggedIn, customerRole("admin"), adminGetAllOrders)
router.route('/admin/updateOrder/:id').put(isLoggedIn, customerRole("admin"), adminUpdateOrder)
router.route('/admin/deleteOrder/:id').delete(isLoggedIn, customerRole("admin"), adminDeleteOrder)

module.exports = router


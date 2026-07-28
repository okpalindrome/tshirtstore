const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../middlewares/user')
const { 
    sendStripeKey,
    acceptStripePayment,
    sendRazorKey,
    acceptRazorpayPayment } = require('../controllers/paymentController')


router.route('/stripekey').get(isLoggedIn, sendStripeKey)
router.route('/razorpaykey').get(isLoggedIn, sendRazorKey)

router.route('/acceptStripePayment').post(isLoggedIn, acceptStripePayment)
router.route('/acceptRazorpayPayment').post(isLoggedIn, acceptRazorpayPayment)

module.exports = router
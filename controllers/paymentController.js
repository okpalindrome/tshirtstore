const BigPromise = require("../middlewares/bigPromise");
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const { v4: uuidv4 } = require('uuid')

exports.sendStripeKey = BigPromise(async (req, res, next) => {
    res.statu(200).json({
        success: true,
        stripeKey: process.env.STRIPE_API_KEY
    })
})

exports.acceptStripePayment = BigPromise(async (req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: 'inr',
        metadata: {integration_check:"accept_a_payment"}
    });

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        client_sceret: paymentIntent.client_sceret
    })
})

exports.sendRazorKey = BigPromise(async (req, res, next) => {
    res.statu(200).json({
        success: true,
        stripeKey: process.env.RAZORPAY_API_KEY
    })
})

exports.acceptRazorpayPayment = BigPromise(async (req, res, next) => {
    var instance = new Razorpay({ key_id: process.env.RAZORPAY_API_KEY, key_secret: process.env.RAZORPAY_SECRET })

    const myOrder = await instance.orders.create({
    amount: req.body.amount,
    currency: "INR",
    receipt: uuidv4()
    })

    res.status(200).json({
        success: true, 
        myOrder: myOrder
    })
})

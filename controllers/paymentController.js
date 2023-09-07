const BigPromise = require("../middlewares/bigPromise");
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const { v4: uuidv4 } = require('uuid')
const Razorpay = require("razorpay")

exports.sendStripeKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        success: true,
        stripeKey: process.env.STRIPE_API_KEY
    })
})

exports.acceptStripePayment = BigPromise(async (req, res, next) => {
    
    try {
        
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount * 100,
        currency: 'inr',
        metadata: {integration_check:"accept_a_payment"}
    });

    res.status(200).json({
        success: true,
        amount: req.body.amount,
        client_sceret: paymentIntent.client_secret
    })

    } catch (error) {
        res.status(400).json({
            success: false,
             message: "Something went wrong. Try entering the correct information"
        }) 
    }
})

exports.sendRazorKey = BigPromise(async (req, res, next) => {
    res.status(200).json({
        success: true,
        stripeKey: process.env.RAZORPAY_API_KEY
    })
})

exports.acceptRazorpayPayment = BigPromise(async (req, res, next) => {
    
    try {
        
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

    } catch (error) {
        res.status(400).json({
            success: false,
             message: "Something went wrong. Try entering the correct information"
        })
    }
})

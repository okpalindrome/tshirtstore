const Order = require('../models/order')
const Product = require('../models/product')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')
const { default: mongoose } = require('mongoose')


exports.createOrder = BigPromise(async (req, res, next) => {
    let {
        shippingInfo, // address, phoneNo, city, state, postalCode, country
        orderItems, // quantity, product except for price
        paymentInfo, // after sucessful payment - id
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body
    
    // const productId = Product.Type.ObjectId(orderItems.product)
    const temp = await Product.findById({_id: mongoose.Schema.Types.ObjectId(orderItems.product)})
    if(!temp) {
        return next(new CustomError("Product not found", 404))
    }
    orderItems.name = temp.name 
    orderItems.price = temp.price

    const order = await Order.create({
        shippingInfo, // address, phoneNo, city, state, postalCode, country
        orderItems, // name, quantity, product except for price
        paymentInfo, // after sucessful payment - id
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        // orderID: order._id, 
        message: "Order placed successfully",
        order
    })
})
const Order = require('../models/order')
const Product = require('../models/product')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')


exports.createOrder = BigPromise(async (req, res, next) => {
    let {
        shippingInfo, // address, phoneNo, city, state, postalCode, country
        orderItems, // quantity, product except for name & price
        paymentInfo, // after sucessful payment - id
        taxAmount,
        shippingAmount,
        totalAmount,
    } = req.body

    // for multiple products
    let product
    for (let index = 0; index < orderItems.length; index++) {
        product = await Product.findById({_id: orderItems[index].product}).select('name price')
        orderItems[index]["name"] = product.name
        orderItems[index]["price"] = product.price        
    }

    if(!product) {
        return next(new CustomError("Product does not exist", 404))
    }

    const order = await Order.create({
        shippingInfo,
        orderItems, 
        paymentInfo, 
        taxAmount,
        shippingAmount,
        totalAmount,
        user: req.user._id
    })

    res.status(200).json({
        success: true,
        orderID: order._id, 
        message: "Order placed successfully",
        order
    })
})

exports.getOneOrderDetails = BigPromise(async (req, res, next) => {

    // populate - to get further details from order.user -> user.name and user.email
    const order = await Order.findById(req.params.id).populate('user', 'name email')

    if(!order) {
        return next(new CustomError("There is no order with this ID, please check!", 404))
    }
    else if(order && (order.user.equals(req.user.id) || req.user.role === "admin" || req.user.role === "manager")) {
        res.status(200).json({
            success: true,
            order
        })
    }
    else {
        return next(new CustomError("You're not authorised to access this order details", 403))
    }
})

exports.getMyOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find({user: req.user._id})

    if(!orders) {
        return next(new CustomError("There are no orders, keep shopping", 404))
    }
    
    res.status(200).json({
        success: true,
        total_orders: orders.length, 
        orders
    })
})

exports.adminGetAllOrders = BigPromise(async (req, res, next) => {
    const orders = await Order.find()
    
    res.status(200).json({
        success: true,
        total_orders: orders.length, 
        orders
    })
})

exports.adminUpdateOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)
    
    if(!order) {
        return next(new CustomError("No orders found", 404))
    }

    if(!['processing', 'dispatched', 'shipped', 'delivered'].includes(req.body.orderStatus)) {
        return next(new CustomError("Wrong option - Please select category ONLY from: processing, dispatched, shipped or delivered", 400))
    }
    
    if(req.body.orderStatus === 'delivered') {
        if(order.orderStatus === 'delivered') {
            res.status(400).json({
                success: false,
                message: "Order was already delivered on " + order.deliveredOn
            })
            return next(new CustomError("Order is delivered", 400))
        }
        order.deliveredOn = Date.now()

        for (let index = 0; index < order.orderItems.length; index++) {
            await updateProductStock(order.orderItems[index].product, order.orderItems[index].quantity)   
        }
    }

    order.orderStatus = req.body.orderStatus
    await order.save()

    res.status(200).json({
        success: true,
        message: "Order status is updated successfully.",
        order
    })
})

exports.adminDeleteOrder = BigPromise(async (req, res, next) => {
    const order = await Order.findById(req.params.id)

    if(!order) {
        return next(new CustomError("Product deos not exist", 404))
    }

    // object.remove() does not work
    await Order.deleteOne({_id: req.params.id})

    res.status(200).json({
        success: true,
        message: "Order removed"
    })
})

// updating the stock
async function updateProductStock(productId, quantity) {
    const product = await Product.findById(productId)

    // need more work to do on stock manipulation from different routes as well
    product.stock = product.stock - quantity
    await product.save()
}
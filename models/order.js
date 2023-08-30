const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        postalCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: {
                type: String,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: String,
                required: true,
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: 'Product',
                required: true,
            }
        }
    ],
    paymentInfo: {
        id: {
            type: String
        }
    },
    taxAmount : {
        type: Number,
        required: true
    },
    shippingAmount: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: String,
        required: true,
    },
    orderStatus: {
        type: String,
        required: true,
        default: 'processing',
        enum: {
            values: ['processing', 'dispatched', 'shipped', 'delivered'], 
            message: 'Please select category ONLY from: processing, dispatched, shipped or delivered'
        }
    },
    deliveredOn: {
        type: Date,
    },
    createdAt: {
        type: String,
        default: Date.now
    },
})

module.exports = mongoose.model("Order", orderSchema)
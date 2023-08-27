const mongoos = require('mongoose')

const productSchema = new mongoos.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        maxlength: [120, 'Product name should not be more than 120 characts']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        maxlength: [5, 'Product price should not be more than 5 digits']
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    photos: [{
        id: {
            type: String,
            required: true
        },
        secure_url: {
            type: String,
            required: true
        }
    }],
    category: {
        type: String,
        required: [true, 'Please select category from: short-sleeves, long-sleeves, sweat-shirts, hoodies'],
        enum: {
            values: ['shortsleeves', 'longsleeves', 'sweatshirt', 'hoodies'], 
            message: 'Please select category ONLY from: short-sleeves, long-sleeves, sweat-shirts, hoodies'
        }
    },
    brand: {
        type: String,
        required: [true, 'Please add a brand for clothing']
    },
    stock: {
        type: Number,
        required: [true, 'Please add available stock in numbers'],
        default: 0
    },
    ratings: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [{
        user: {
            type: mongoos.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            required: true
        },
        comment: {
            type: String,
            required: true
        }
    }],
    user: {
        type: mongoos.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})  

module.exports = mongoos.model('Product', productSchema)
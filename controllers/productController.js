const BigPromise = require("../middlewares/bigPromise");
const Product = require("../models/product");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");

exports.addProduct = BigPromise(async (req, res, next) => {
    
    // this is required, because if any one field is missing
    // - the DB throughs error after a successful photos upload on cloudinary
    const {name, price, description, category, brand, stock} = req.body
    
    if (!name || !price || !description || !category || !brand || !stock) {
        res.status(400).json({
            success: false,
            message: "Please provide all details"
        })
        return next(new CustomError("Please provide all details", 401))
    }

    // same case with selection of wrong category
    if(!['shortsleeves', 'longsleeves', 'sweatshirt', 'hoodies'].includes(category)) {
        res.status(400).json({
            success: false,
            message: "Please select category ONLY from: short-sleeves, long-sleeves, sweat-shirts, hoodies"
        })
        return next(new CustomError("Please select category ONLY from: short-sleeves, long-sleeves, sweat-shirts, hoodies", 400))
    }

    const imageArray = []

    if(!req.files) {
        res.status(401).json({
            success: false,
            message: "Images are required"
        })
        return next(new CustomError("Images are required", 401))
    }
    else {
        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, {
                folder: "products",
            })

            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        }
    }

    req.body.photos = imageArray
    req.body.user = req.user.id
    
    const product = await Product.create({
        name, 
        price, 
        description,
        category,
        brand,
        stock,
        user: req.body.user,
        photos: imageArray
    })

    res.status(200).json({
        success: true, 
        product
    })

})

exports.getAllProducts = BigPromise(async (req, res, next) => {
    
    const resultPerPage = 6
    // const count = await Product.countDocuments()
    
    const productsObj = new WhereClause(Product.find(), req.query).search().filter();
    let products = await productsObj.base
    
    const filteredProductCount = products.length

    // products.limit().skip()
    // OR because we are calculate inside pager function already
    productsObj.pager(resultPerPage)
    products = await productsObj.base.clone()

    res.status(200).json({
        success: true,
        filteredProductCount,
        products
    })
})

exports.adminGetAllProducts = BigPromise(async (req, res, next) => {
    const products = await Product.find()

    if(!products) {
        res.status(404).json({
            success: false,
            message: "No products found"
        })
        return next(new CustomError("No products found."), 404)
    }

    res.status(200).json({
        success: true,
        products
    })
})

exports.getOneProduct = BigPromise(async (req, res, next) => {
    
    try {
        const product = await Product.findById(req.params.id)

        if(!product) {
            res.status(404).json({
                success: false,
                message: "Product does not exist"
            })
            return next(new CustomError("Product does not exist", 404))
        }
        
        res.status(200).json({
            success: true,
            product
        })

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid product ID"
        })
        return next(new CustomError("Invalid product ID", 401))
    }
    
})

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
    
    const newData = {}
    let imageArray = []
    // try {
        
    if(!req.params.id) {
        res.status(400).json({
            success: false,
            message: "Please provide product id"
        })
        return next(new CustomError("Please provide product id", 400))
    }
    
    const product = await Product.findById(req.params.id)

    if(!product) {
        res.status(404).json({
            success: false,
            message: "Product does not exist"
        })
        return next(new CustomError("Product does not exist", 404))
    }

    req.body.name ? newData.name = req.body.name : ""
    req.body.price ? newData.price = req.body.price : ""
    req.body.description? newData.description = req.body.description : ""
    req.body.brand? newData.brand = req.body.brand : ""
    req.body.stock? newData.stock = req.body.stock : ""

    if(req.body.category) {
        if(!['shortsleeves', 'longsleeves', 'sweatshirt', 'hoodies'].includes(req.body.category)) {
            res.status(400).json({
                success: false,
                message: "Please select category ONLY from: short-sleeves, long-sleeves, sweat-shirts, hoodies"
            })
            return next(new CustomError("Please select category ONLY from: short-sleeves, long-sleeves, sweat-shirts, hoodies", 400))
        }
        newData.category = req.body.category
    }

    if(req.files) {
        // delete existing
        for (let index = 0; index < product.photos.length; index++) {
            await cloudinary.v2.uploader.destroy(product.photos[index].id)
        }

        // upload new photos
        for (let index = 0; index < req.files.photos.length; index++) {
            let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath, 
                {
                folder: "products",
            })

            imageArray.push({
                id: result.public_id,
                secure_url: result.secure_url
            })
        } 
        
        newData.photos = imageArray
    }
    
    // } catch (error) {
    //     return next(new CustomError("Invalid Product ID", 400))
    // }

    productUpdated = await Product.findByIdAndUpdate(req.params.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        productUpdated
    })
})

exports.adminDeleteOneProduct = BigPromise(async (req, res, next) => {
    
    try {
    const product = await Product.findById(req.params.id)

    if(!product) {
        res.status(404).json({
            success: false,
            message: "Product does not exist"
        })
        return next(new CustomError("Product does not exist", 404))
    }

    // delete photos
    for (let index = 0; index < product.photos.length; index++) {
        await cloudinary.v2.uploader.destroy(product.photos[index].id)
    }

    await Product.deleteOne({_id: req.params.id})

    res.status(200).json({
        success: true,
        message: "Product removed."
    })

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid Product ID"
        })
        return next(new CustomError("Invalid Product ID", 401))
    }
})

exports.addReview = BigPromise(async (req, res, next) => {

    const {rating, comment, productID} = req.body

    if(!rating || !comment || !productID) {
        res.status(400).json({
            success: false,
            message: "Please provide all review information - rating(1-5), comment and productID"
        })
        return next(new CustomError("Please provide all review information - rating(1-5), comment and productID", 400))
    }

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productID)

    // looping through each review field for the given product
    const alreadyReviewed = product.reviews.find( 
        (rev) => rev.user.toString() === req.user._id.toString())

    if(alreadyReviewed) {
        // picking that particular review field to edit
        product.reviews.forEach((review) => {
            if(review.user.toString() === req.user._id.toString()) {
                review.comment = comment
                review.rating = rating
            }
        })
    } else {
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length
    }

    // average/overall ratings
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    // save DB
    await product.save({validateBeforeSave: false})

    res.status(200).json({
        success: true,
        message: review
    })

})

exports.deleteReview = BigPromise(async (req, res, next) => {
    const productID = req.query.productID

    const product = await Product.findById(productID)

    if(!product) {
        res.status(404).json({
            success: false,
            message: "Product not found"
        })
        return next(new CustomError("Product not found", 404))
    }

    // get the user's review on the product
    const reviews = product.reviews.filter((rev) => rev.user.toString() !== req.user._id.toString())

    const numberOfReviews = reviews.length
    let ratings
    if (numberOfReviews === 0) {
         ratings = 0
    } else {
        ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length
    }

    // update the product
    await Product.findByIdAndUpdate(productID, {
        reviews,
        ratings,
        numberOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message: "Deleted your review on this product"
    })

})

exports.getOnlyReviewForOneProduct = BigPromise(async (req, res, next) => {
    const productID = req.query.productID

    const product = await Product.findById(productID)

    if(!product) {
        res.status(404).json({
            success: false,
            message: "Product not found"
        })
        return next(new CustomError("Product not found", 404))
    }

    res.status(200).json({
        success: true,
        "Overall_Ratings": product.ratings,
        "Total_number_of_reviews": product.numberOfReviews,
        reviews: product.reviews
    })
})
const BigPromise = require("../middlewares/bigPromise");
const Product = require("../models/product");
const CustomError = require("../utils/customError");
const cloudinary = require("cloudinary");
const WhereClause = require("../utils/whereClause");
const product = require("../models/product");

exports.addProduct = BigPromise(async (req, res, next) => {
    
    // this is required, because if any one field is missing
    // - the DB throughs error after a successful photos upload on cloudinary
    const {name, price, description, category, brand, stock} = req.body
    
    if (!name || !price || !description || !category || !brand || !stock) {
        return next(new CustomError("Please provide all details", 401))
    }

    // same case with selection of wrong category
    if(!['shortsleeves', 'longsleeves', 'sweatshirt', 'hoodies'].includes(category)) {
        return next(new CustomError("Please select category ONLY from: short-sleeves, long-sleeves, sweat-shirts, hoodies"))
    }

    const imageArray = []

    if(!req.files) {
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
            return next(new CustomError("Product does not exist", 404))
        }
        
        res.status(200).json({
            success: true,
            product
        })

    } catch (error) {
        return next(new CustomError("Invalid product ID", 401))
    }
    
})

exports.adminUpdateOneProduct = BigPromise(async (req, res, next) => {
    
    const newData = {}
    let imageArray = []
    // try {
        
    if(!req.params.id) {
        return next(new CustomError("Please provide product id", 400))
    }
    
    const product = await Product.findById(req.params.id)

    if(!product) {
        return next(new CustomError("Product does not exist", 404))
    }

    req.body.name ? newData.name = req.body.name : ""
    req.body.price ? newData.price = req.body.price : ""
    req.body.description? newData.description = req.body.description : ""
    req.body.brand? newData.brand = req.body.brand : ""
    req.body.stock? newData.stock = req.body.stock : ""

    if(req.body.category) {
        if(!['shortsleeves', 'longsleeves', 'sweatshirt', 'hoodies'].includes(req.body.category)) {
            return next(new CustomError("Please select category ONLY from: short-sleeves, long-sleeves, sweat-shirts, hoodies"))
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
        return next(new CustomError("Invalid Product ID", 401))
    }
})
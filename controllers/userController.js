const User = require('../models/user')
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')
const cookieToken = require('../utils/cookieToken')
const fileupload = require('express-fileupload')
const cloudinary = require('cloudinary')
const mailHelper = require('../utils/mailHelper')
const crypto = require('crypto')

exports.signup = BigPromise(async (req, res, next) => {

    if(!req.files){
        return next(new CustomError("Photo is required for signup", 400))
    }

    const {name, email, password} = req.body

    if(!name || !email || !password) {
        return next(new CustomError('Name, email and password are requied!', 400))
    }

    let file = req.files.photo
    
    const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder: "users",
        width: 150,
        crop: "scale"
    })

    // creating a new entry in the DB
    const user = await User.create({
        name, 
        email,
        password,
        photo: {
            id: result.public_id,
            secure_url: result.secure_url
        }    
    })

    cookieToken(user, res)
}) 

exports.login = BigPromise(async (req, res, next) => {
    const {email, password} = req.body

    // check for email or password existing in the request or not
    if (!email || !password) {
        return next(new CustomError('Please provide email and password', 400))
    }

    // chech in db
    const user = await User.findOne({email}).select("+password")

    // user exist or not
    if (!user) {
        return next(new CustomError("Email or password is incorrect", 400))
    }

    // validate the password
    const isPasswordValid = await user.isValidatedPassword(password)

    if(!isPasswordValid){
        return next(new CustomError("Email or password is incorrect"))
    }

    // set jwt token in cookie
    cookieToken(user, res)
})

exports.logout = BigPromise(async (req, res, next) => {
    // resetting the token
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    // sending the updated response
    res.status(200).json({
        success: true,
        message: "Logout Successful"
    })
})

exports.forgotPassword = BigPromise(async (req, res, next) => {
    const {email} = req.body

    if(!email){
        return next(new CustomError("Please provide a valid email address", 400))
    }

    // check in the DB
    const user = await User.findOne({email})

    if (!user){
        return next(new CustomError("Please provide a valid email address", 400))
    }

    // get a token
    const forgotToken = user.getForgotPasswordToken()
    
    // save the generated token in DB
    await user.save({validateBeforeSave: false})

    // format a url and message
    const myUrl = `${req.protocol}://${req.get("host")}/password/reset/${forgotToken}`
    const message = `Copy and paste this link in your Browser \n\n ${myUrl}`

    try {
        await mailHelper({
            email: user.email,
            subject: "TStore Online - Password reset email",
            message
        })

        res.status(200).json({
            success: true,
            message: "Email sent successfully."
        })

    } catch (error) {
        // if email did not send successfully, reset the above generated token and expire date. Finally update the DB 
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        await user.save({validateBeforeSave: false})

        return next(new CustomError(error.message, 500))
    }
})

exports.passwordReset = BigPromise(async (req, res, next) => {
    const token = req.params.token

    const encryptedToken = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
        forgotPasswordToken: encryptedToken,
        forgotPasswordExpiry: {$gt: Date.now()}})
    
    if (!user) {
        return next(new CustomError("Token is invalid or expired", 400))
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new CustomError("Password and confirm password do not match", 400))
    }

    // update the database
    user.password = req.body.password
    user.forgotPasswordToken = undefined
    user.forgotPasswordExpiry = undefined
    await user.save()

    // we can send a session token or send a json response
    // set jwt token in cookie
    cookieToken(user, res)

    // or send a json response
    // res.status(200).json({
    //     success: true,
    //     message: "Password reset successful."
    // })
})

exports.getLoggedInUserDetails = BigPromise(async (req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user,
    })
})

exports.changePassword = BigPromise(async (req, res, next) => {
    const {currentPassword, password, confirmPassword} = req.body

    if(!currentPassword || !password || !confirmPassword) {
        return(new CustomError("Please provide all fields - currentPassword, password and confirmPassword"))
    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new CustomError("New Password and confirm password do not match", 400))
    }
    const userId = req.user.id

    const user = await User.findById(userId).select("+password")

    const isValidCurrentPassword = await user.isValidatedPassword(currentPassword)

    if(!isValidCurrentPassword) {
        return next(new CustomError("Current password is incorrect", 400))
    }
    
    user.password = password
    await user.save()
    
    cookieToken(user, res)
})

exports.updateUserDetails = BigPromise(async (req, res, next) => {
    
    const newData = {}
    if(req.body.name) {
       newData.name = req.body.name 
    }

    if(req.body.email) {
        newData.email = req.body.email
    }
    
    if (req.files){
        const user = await User.findById(req.user.id)

        // delete photo
        const imageId = user.photo.id
        await cloudinary.v2.uploader.destroy(imageId)

        // upload new photo
        const result = await cloudinary.v2.uploader.upload(req.files.photo.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
        })

        newData.photo = {
            id: result.public_id,
            secure_url: result.secure_url
        }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        message: "Updated the details",
        user
    })

})
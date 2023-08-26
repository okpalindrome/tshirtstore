const User = require("../models/user")
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')
const jwt = require("jsonwebtoken")

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    const token = req.cookies.token || (req.header("Authorization") ? req.header("Authorization").replace("Bearer ", "") : undefined);

    if(!token){
        return next(new CustomError("Login first to access this page", 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)

    if(!req.user){
        return next(new CustomError("The user-id does not exist"), 401)
    }

    next();
})

exports.customerRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new CustomError("You are not allowed to access this resource", 403))
        }
        next()
    }
}
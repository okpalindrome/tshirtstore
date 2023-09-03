const User = require("../models/user")
const BigPromise = require('../middlewares/bigPromise')
const CustomError = require('../utils/customError')
const jwt = require("jsonwebtoken")

exports.isLoggedIn = BigPromise(async (req, res, next) => {
    const token = req.cookies.token || (req.header("Authorization") ? req.header("Authorization").replace("Bearer ", "") : undefined);

    if(!token){
        res.status(401).json({
            success: false,
            message: "Session expired, please login again!"
        })
        return next(new CustomError("Login first to access this page", 401))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id)

    if(!req.user){
        res.status(401).json({
            success: false,
            message: "The user-id does not exist"
        })
        return next(new CustomError("The user-id does not exist"), 401)
    }

    next();
})

exports.customerRole = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: "You are not allowed to access this resource"
            })
            return next(new CustomError("You are not allowed to access this resource", 403))
        }
        next()
    }
}
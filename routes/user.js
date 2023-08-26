const express = require('express')
const router = express.Router()

const {
    signup, 
    login, 
    logout, 
    forgotPassword, 
    passwordReset, 
    getLoggedInUserDetails, 
    changePassword,
    updateUserDetails,
    adminAllUser,
    managerAllUser,
    adminGetSingleUser, 
    adminUpdateOneUserDetails,
    adminDeleteOneUser } = require('../controllers/userController')
const { isLoggedIn, customerRole } = require('../middlewares/user')

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/logout').get(logout)
router.route('/forgotPassword').post(forgotPassword)
router.route('/password/reset/:token').post(passwordReset)
router.route('/userDashboard').get(isLoggedIn, getLoggedInUserDetails)  // isLoggedIn middle is injected in the routes
router.route('/password/update').post(isLoggedIn, changePassword)
router.route('/userDashboard/update').post(isLoggedIn, updateUserDetails)


// admin routes
router.route('/admin/users').get(isLoggedIn, customerRole("admin"), adminAllUser)
router.route('/admin/user/:id')
.get(isLoggedIn, customerRole("admin"), adminGetSingleUser)
.put(isLoggedIn, customerRole("admin"), adminUpdateOneUserDetails)
.delete(isLoggedIn, customerRole("admin"), adminDeleteOneUser)

// manager routes
router.route('/manager/users').get(isLoggedIn, customerRole("manager"), managerAllUser)

module.exports = router
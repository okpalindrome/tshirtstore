const cookieToken = (user, res) => {
        // get session token
        const token = user.getJwtToken()

        // setting teh session token in the cookie
        const options = {
            expires: new Date(Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000),
            httpOnly: true
        }
    
        res.status(200).cookie('token', token, options).json({
            success: true,
            token,
            user
        })
}


module.exports = cookieToken
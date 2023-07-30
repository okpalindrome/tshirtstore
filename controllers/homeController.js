const BigPromise = require("../middlewares/bigPromise")

//bigpromise accepts a function as an argument and we can put in async
exports.home = BigPromise(async (req, res) => {
    // const db = await something()
    res.status(200).json({
        success: true,
        message: "Hello from API"
    });
})


exports.homeDummy = (req, res) => {
    res.status(200).json({
        success: true,
        message: "Hello from another dummy route"
    });
};
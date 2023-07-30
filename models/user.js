const mongoos = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = new mongoos.Schema({
    name: {
        type: String,
        required: [true, "Please provide a name"],
        maxlength: [40, "Name should be under 40 characters"],
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        validate: [validator.isEmail, "Please enter a valid format"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: [8, "Password should be atleast 8 character"],
        select: false
    },
    role: {
        type: String,
        default: 'user'
    },
    photo: {
        id: {
            type: String,
            required: true,
        },
        secure_url: {
            type: String,
            required: true,
        },

    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

// encrypt password before save
userSchema.pre('save', async function(next) {
    // to avoid encrypting/hasing the password each time this schema is called
    if (!this.isModified('password')){
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// validate the password. Example - for login
userSchema.methods.isValidatedPassword = async function(usersendPassword){
    return await bcrypt.compare(usersendPassword, this.password)
}

// create and return JWT token
userSchema.methods.getJwtToken = function () {
    return jwt.sign({id : this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRY})
}

// generate token for forgot password feature
userSchema.methods.getForgotPasswordToken = function () {
    // generating random string
    const forgotoken = crypto.randomBytes(20).toString('hex')
    
    // store the hash of the actual token. It is good practice to compare using hash of the token than actual token itself
    this.forgotPasswordToken = crypto.createHash('sha256').update(forgotoken).digest('hex')

    // setting time for token
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000

    return forgotoken
}


// mangoos converts User to users (yes with plural)
module.exports = mongoos.model("User", userSchema)
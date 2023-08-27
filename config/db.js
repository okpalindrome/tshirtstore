const mongoos = require('mongoose')

const connectWithDb = () => {
    mongoos.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("DB Connection Successful"))
    .catch((error) => {
        console.log('DB Connection Failed')
        console.log(error)
        process.exit(1)
    })
}

module.exports = connectWithDb
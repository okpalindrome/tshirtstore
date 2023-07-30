const app = require("./app");
require("dotenv").config();
const connectWithDb = require('./config/db')

//connect with DB
connectWithDb();

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port: ${process.env.PORT}`);
});
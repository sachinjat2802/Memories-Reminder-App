const mongoose = require("mongoose");

const dbConnection = async (DB_URL) => {
    await mongoose
        .connect(DB_URL)
        .then(()=> {
            console.log("Mongoose connection is opened successfully ");
        })
        .catch((err)=> {
            console.log(`Mongoose connection is ${err}`);
        })
}
module.exports = dbConnection;

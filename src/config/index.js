const mongooseConnect = require("./mongoose-config");
module.exports = {
    PORT: process.env.PORT || 3000,
    DB_URL: process.env.DB_URL || "mongodb://docker:mongopw@localhost:55000",
    TOKEN_SECRET: process.env.TOKEN_SECRET || "hi this is memory app...",
    mongooseConnect,
}

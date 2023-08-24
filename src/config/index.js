const mongooseConnect = require("./mongoose-config");
module.exports = {
    PORT: 3000,
    DB_URL: "mongodb://docker:mongopw@localhost:55000",
    TOKEN_SECRET: "hi this is memory app...",
    mongooseConnect,
}

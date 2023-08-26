const mongooseConnect = require("./mongoose-config");
module.exports = {
    PORT: process.env.PORT || 3000,
    DB_URL: process.env.DB_URL || "mongodb+srv://myAtlasDBUser:root@myatlasclusteredu.u3lj8ji.mongodb.net/?retryWrites=true&w=majority",
    TOKEN_SECRET: process.env.TOKEN_SECRET || "hi this is memory app...",
    mongooseConnect,
}

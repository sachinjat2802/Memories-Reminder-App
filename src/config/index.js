const mongooseConnect = require("./mongoose-config");
const DB_NAME = "memories";
module.exports = {
    HOST: process.env.HOST || "http://139.59.95.44",
    PORT: process.env.PORT || 3000,
    MAILID: process.env.MAILID || 'dummypurposepvt@gmail.com',
    MAIL_PASSWORD: process.env.MAIL_PASSWORD || 'zwegashxkjmcjwrp',
    DB_URL: process.env.DB_URL || `mongodb+srv://myAtlasDBUser:root@myatlasclusteredu.u3lj8ji.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
    TOKEN_SECRET: process.env.TOKEN_SECRET || "hi this is memory app...",
    mongooseConnect,
}

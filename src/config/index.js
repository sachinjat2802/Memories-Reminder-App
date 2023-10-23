const mongooseConnect = require("./mongoose-config");
const DB_NAME = "memories";
module.exports = {
    HOST: process.env.HOST || "http://139.59.95.44",
    PORT: process.env.PORT || 3000,
    MAILID: process.env.MAILID || 'notifications@revisitro.com',
    MAIL_USER: process.env.MAIL_USER || 'AKIA2Y7GDWJQIDAWOBWL',
    MAIL_PASSWORD: process.env.MAIL_PASSWORD || 'BLiRGE6mV4SYkQqDPMas5tDeRyZgr1kZ2rvcIgWOHR00',
    DB_URL: process.env.DB_URL || `mongodb+srv://myAtlasDBUser:root@myatlasclusteredu.u3lj8ji.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
    TOKEN_SECRET: process.env.TOKEN_SECRET || "hi this is memory app...",
    mongooseConnect,
}

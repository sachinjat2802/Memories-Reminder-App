const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const expressFileUpload = require('express-fileupload');
require("dotenv").config();

const { PORT, DB_URL, mongooseConnect } = require("./config");
const userRoute = require("./api/user");
const memoryRoute = require("./api/memories");


mongooseConnect(DB_URL);
const app = express();
app.use(cors());
app.use(expressFileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", userRoute);
app.use("/memory", memoryRoute);

app.listen(PORT, () => {
    console.log(`App started successfully in port ${PORT}.`);
});

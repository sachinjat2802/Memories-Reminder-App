const cors = require("cors");
const cron = require("node-cron");
const express = require("express");
const bodyParser = require("body-parser");
const expressFileUpload = require('express-fileupload');
require("dotenv").config();

const { PORT, DB_URL, mongooseConnect } = require("./config");
const userRoute = require("./api/user");
const memoryRoute = require("./api/memories");
const automate = require("./services/automation-service");


mongooseConnect(DB_URL);
const app = express();
app.use(cors());
app.use(expressFileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", userRoute);
app.use("/memory", memoryRoute);


cron.schedule('36 * * * *', async () => {
    console.log('running every minute 1, 2, 4 and 5');
    await automate.sendNotification();
});

app.listen(PORT, () => {
    console.log(`App started successfully in port ${PORT}.`);
});

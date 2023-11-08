const cors = require("cors");
const cron = require("node-cron");
const express = require("express");
const bodyParser = require("body-parser");
const expressFileUpload = require('express-fileupload');
require("dotenv").config();

const { PORT, DB_URL, mongooseConnect } = require("./config");
const userRoute = require("./api/user");
const memoryRoute = require("./api/memories");
const notificationRoute = require("./api/notification");
const automate = require("./services/automation-service");


mongooseConnect(DB_URL);
const app = express();
app.use(express.static('files'));
app.use(cors());
app.use(expressFileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", userRoute);
app.use("/memory", memoryRoute);
app.use("/notification", notificationRoute);


cron.schedule('30 8 * * *', async () => {
    console.log('running every day at 8:30 AM');
    await automate.sendNotificationToUser();
});

app.listen(PORT, () => {
    console.log(`App started successfully in port ${PORT}.`);
});

const cors = require("cors");
const cron = require("node-cron");
const express = require("express");
const bodyParser = require("body-parser");
const expressFileUpload = require("express-fileupload");
require("dotenv").config();

const { PORT, DB_URL, mongooseConnect } = require("./config");
const userRoute = require("./api/user");
const memoryRoute = require("./api/memories");
const notificationRoute = require("./api/notification");
const automate = require("./services/automation-service");
const Memory = require("./api/memories/memory-model");
const Notifications = require("./api/notification/notification-model");

mongooseConnect(DB_URL);
const app = express();
app.use(express.static("files"));
app.use(cors());
app.use(expressFileUpload());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/user", userRoute);
app.use("/memory", memoryRoute);
app.use("/notification", notificationRoute);

cron.schedule("* * * * *", async () => {
  console.log("running a task every minute");
  const memories = await Memory.aggregate([
    {
      $group: {
        _id: {
          belongs_to: "$belongs_to",
          createdAt: "$createdAt",
        },
        belongs_to: { $first: "$belongs_to" },
        createdAt: { $first: "$createdAt" },
        count: { $sum: 1 },
        documents: { $push: "$$ROOT" },
      },
    },
    {
      $lookup: {
        from: "notifications",
        localField: "belongs_to",
        foreignField: "belongs_to",
        as: "notifications",
      },
    },
    {
      $addFields: {
        notifications: { $arrayElemAt: ["$notifications", 0] },
        current_date: { $toDate: new Date() },
      },
    },
    {
      $addFields: {
        lookupDate: {
          $cond: {
            if: { $ne: ["$notifications.repeat", null] },
            then: {
              $add: [
                "$current_date",
                { $multiply: ["$notifications.repeat", 24, 60, 60, 1000] },
              ],
            },
            else: {
              $subtract: [
                "$current_date",
                { $multiply: [30, 24, 60, 60, 1000] },
              ],
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "belongs_to",
        foreignField: "email",
        as: "users",
      },
    },
    {
      $addFields: {
        users: { $arrayElemAt: ["$users", 0] },
      },
    },
    {
      $match: {
        "users.enabled_notification": true,
      },
    },
    {
      $match: {
        createdAt: {
          $gte: "$lookupDate",
        },
      },
    },
  ]);

  console.log(memories);
  await automate.sendEventMail(memories);
});

app.listen(PORT, () => {
  console.log(`App started successfully in port ${PORT}.`);
});

const { mongooseConnect } = require("../config");
const { getTodaysEvent, sendNotification } = require("../services/automation-service");

const DB_URL = "mongodb://docker:mongopw@localhost:55000";
mongooseConnect(DB_URL);
// getTodaysEvent();
sendNotification();

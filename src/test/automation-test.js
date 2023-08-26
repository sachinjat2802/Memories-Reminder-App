const { DB_URL, mongooseConnect } = require("../config");
const { getTodaysEvent } = require("../services/automation-service");

mongooseConnect(DB_URL);
getTodaysEvent();

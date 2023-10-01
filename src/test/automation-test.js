const { mongooseConnect } = require("../config");
const { getTodaysEvent, sendNotification } = require("../services/automation-service");

const DB_URL = "mongodb://docker:mongopw@localhost:55000";
mongooseConnect(DB_URL);

const main = async () => {
    const data = await sendNotification();
    console.log(data);
    process.exit(0);
}
main();
// sendNotification();

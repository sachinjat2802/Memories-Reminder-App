const { mongooseConnect } = require("../config");
const { getTodaysEvent, sendNotification, getEventExceptTodays } = require("../services/automation-service");

const DB_URL = "mongodb://docker:mongopw@localhost:55000";
mongooseConnect(DB_URL);

const shouldGetTodaysEvents = async () => {
    const data = await getTodaysEvent();
    console.log(data);
}

const shouldSendNotification = async () => {
    const data = await sendNotification();
}

const shouldGetNotTodayEvents = async () => {
    const data = await getEventExceptTodays();
    console.log(JSON.stringify(data));
}

const main = async () => {
    // await shouldGetNotTodayEvents();
    await shouldSendNotification();
    process.exit(0);
}
main();
// sendNotification();

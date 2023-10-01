const { mongooseConnect } = require("../config");
const { getUsersTodaysNotification } = require("../api/notification/aggregations/user-notification");

const DB_URL = "mongodb://docker:mongopw@localhost:55000";
mongooseConnect(DB_URL);

const main = async () => {
    try {
        const data = await getUsersTodaysNotification("noreply.connectverse@gmail.com");
        console.log(JSON.stringify(data));
    } catch (e) {
        console.log(e);
    }
    process.exit(0);
}

main();

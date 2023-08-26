const cron = require("node-cron");
const { sendMail } = require("./email-service");
const Memory = require("../api/memories/memory-model");
const { sortingAggregations } = require("../api/memories/aggregations");


const sendNotification = async () => {

}

const getTodaysEvent = async () => {
    const date = new Date();
    const today = `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate()}`;
    console.log(today);
    const dateRegex = new RegExp(today, "i");
    const events = await Memory.find({
        event_date: { $regex: dateRegex },
    });
    console.log(events);
}

// cron.schedule('1 * * * *', () => {
//     console.log('running a task every minute');
// });

module.exports = {
    getTodaysEvent,
}

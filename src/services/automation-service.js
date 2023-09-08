const Memory = require("../api/memories/memory-model");
const { sendMail } = require("./email-service");
const { sortingAggregations, searchAggregations } = require("../api/memories/aggregations");

const date = new Date();

const sendNotification = async () => {
    let uniqueMailId = [];
    const todaysEvent = await getTodaysEvent();
    const todaysDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${(date.getDate()).toString().padStart(2, "0")}`;

    for(const event of todaysEvent) {
        const reciptant = event["belongs_to"];
        if(!uniqueMailId.includes(reciptant)) {
            sendMail(reciptant, `Remainder of ${event["tittle"]}`, `Hi ${event["userData"][0]["name"]} This is to notify about "${event["description"]}". `);
            await Memory.updateOne(
                { _id: event["_id"] },
                {
                    $set: {
                        last_notification_sent: new Date(todaysDate),
                    }
                }
            );
            uniqueMailId.push(reciptant);
        }
    };
}

const getTodaysEvent = async () => {
    const events = await searchAggregations.getEventByDate(date.getDate(), date.getMonth() + 1);
    return events;
}

module.exports = {
    getTodaysEvent,
    sendNotification,
}

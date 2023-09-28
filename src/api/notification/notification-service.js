const Notification = require("./notification-model");

const getANotification = async (id, email) => {
    return await Notification.find({ _id: id, belongs_to: email });
}

const getAllNotifications = async (email) => {
    return await Notification.find({ belongs_to: email });
}

const save = async (notificationUpdates, email) => {
    const id = notificationUpdates["_id"];
    delete notificationUpdates["_id"];
    if (id)
        await Notification.updateOne(
            {
                _id: id,
                belongs_to: email,
            },
            {
                $setOnInsert: {
                    belongs_to: email,
                },
                $set: notificationUpdates,
            },
            {
                upsert: true,
            }
        );
    else
        await Notification.create({
            ...notificationUpdates,
            belongs_to: email,
        });
}

const removeNotification = async (notificationId, email) => {
    const filter = {
        _id: notificationId,
        belongs_to: email,
    };
    await Notification.deleteOne(filter);
}

module.exports = {
    getANotification,
    getAllNotifications,
    save,
    removeNotification,
}

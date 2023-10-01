const Notification = require("../notification-model");

const getUsersTodaysNotification = async (email) => {
    const data = await Notification.aggregate([
        {
            $match: {
                belongs_to: email,
                only_date_of_event: true,
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'belongs_to',
                foreignField: 'email',
                as: 'user',
            },
        },
        {
            $match: {
                'user.enabled_notification': true,
            },
        },
        {
            $lookup: {
                from: 'memories',
                localField: 'belongs_to',
                foreignField: 'belongs_to',
                as: 'memoriesList',
            },
        },
        {
            $project: {
                _id: 1,
                tittle: 1,
                description: 1,
                image: 1,
                tag: 1,
                limit: 1,
                repeat: 1,
                'user._id': 1,
                'user.name': 1,
                'user.email': 1,
                'memoriesList._id': 1,
                'memoriesList.belongs_to': 1,
                'memoriesList.tittle': 1,
                'memoriesList.description': 1,
                'memoriesList.tags': 1,
                'memoriesList.description': 1,
                'memoriesList.event_date': 1,
                'memoriesList.imageCount': { $size: '$memoriesList.image' },
            }
        },
    ]);
    return data;
}

module.exports = {
    getUsersTodaysNotification,
}

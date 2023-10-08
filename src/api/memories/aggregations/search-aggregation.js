const Memory = require("../memory-model");

const search = async (email, searchString) => {
    try {
        const regex = new RegExp(searchString, 'i');
        const data = await Memory.aggregate([
            {
                $match: {
                    belongs_to: email,
                    $or: [
                        {
                            tags: {
                                $elemMatch: {
                                    $regex: regex,
                                }
                            }
                        },
                        {
                            tittle: {
                                $regex: regex,
                            }
                        },
                        {
                            description: {
                                $regex: regex,
                            }
                        }
                    ]
                },
            },
        ]).then((result) => {
            let returnValue = [];
            for (let doc of result) {
                if (doc) {
                    if (doc["image"]) {
                        let images = [];
                        for (let image of doc["image"]) {
                            // console.log(image);
                            // const binaryDataBuffer = Buffer.from(image["data"], "base64");
                            // image["data"] = binaryDataBuffer.buffer;
                            // console.log("===?>", image["data"].toString("ascii"));
                            images.push(image);
                        }
                        doc["image"] = images;
                    }
                    returnValue.push(doc);
                }
            }
            return returnValue;
        });
        return data;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

const getTags = async (email, tag) => {
    try {
        const regex = new RegExp(tag, 'i');
        const data = await Memory.aggregate([
            {
                $match: {
                    belongs_to: email,
                    $or: [
                        {
                            tags: {
                                $elemMatch: {
                                    $regex: regex,
                                }
                            }
                        }
                    ]
                },
            },
            {
                $project: {
                    tags: 1,
                },
            }
        ]);
        return data;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

const getEventByDate = async (targetDay, targetMonth) => {
    try {
        const events = await Memory.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: '$event_date' }, targetMonth] },
                            { $eq: [{ $dayOfMonth: '$event_date' }, targetDay] },
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'belongs_to',
                    foreignField: 'email',
                    as: 'userData'
                },
            },
            {
                $match: {
                    "userData.enabled_notification": true,
                }
            },
            {
                $lookup: {
                    from: 'notifications',
                    localField: 'belongs_to',
                    foreignField: 'belongs_to',
                    // let: { belongs_to: '$belongs_to', tittle: 'Sample Title', description: "$description", tags: '$tags', imageCount: { $size: '$image' } },
                    // pipeline: [
                    //     {
                    //         $match: {
                    //             $expr: {
                    //                 $and: [
                    //                     { $eq: ['$belongs_to', '$$belongs_to'] }, // Match inner field with outer field
                    //                     // { $eq: ['$tittle.tittles', 'Sample Title'] }, // Match dynamic product name 
                    //                 ],
                    //             },
                    //             // 'tittle.tittles': {
                    //             //     $elemMatch: { $eq: '$$tittle' }, // Use $elemMatch to check if the array contains 'ValueToCheck'
                    //             // },
                    //         },
                    //     },
                    // ],
                    as: 'notification'
                },
            },
            {
                $match: {
                    'notification.only_date_of_event': true,
                },
            },
            {
                $project: {
                    // image: 0,
                    // userData: 0,
                    "userData.__v": 0,
                    "userData.dob": 0,
                    // "userData.email": 0,
                    "userData._id": 0,
                    "userData.password": 0,
                    "userData.is_loggedin": 0,
                    "userData.profilePicture": 0,
                    "userData.createdAt": 0,
                    "userData.updatedAt": 0,
                    "userData.isDeleted": 0,
                    isDeleted: 0,
                    createdAt: 0,
                    updatedAt: 0,
                }
            },
        ]);
        return events;
    } catch (e) {
        console.log(e);
        throw e;
    }
}


const getRestOfEvents = async (targetDay, targetMonth) => {
    try {
        const events = await Memory.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $ne: [{ $month: '$event_date' }, targetMonth] },
                            { $ne: [{ $dayOfMonth: '$event_date' }, targetDay] },
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'belongs_to',
                    foreignField: 'email',
                    as: 'userData'
                },
            },
            {
                $match: {
                    "userData.enabled_notification": true,
                }
            },
            {
                $lookup: {
                    from: 'notifications',
                    localField: 'belongs_to',
                    foreignField: 'belongs_to',
                    as: 'notification',
                },
            },
            // {
            //     $match: {
            //         'notification.only_date_of_event': false,
            //     },
            // },
            {
                $project: {
                    _id: 1,
                    tittle: 1,
                    belongs_to: 1,
                    description: 1,
                    tags: 1,
                    image: { $size: "$image" },
                    last_notification_sent: 1,
                    mails_count: 1,
                    "notification.limit": 1,
                    "notification.repeat": 1,
                    "notification.image": 1,
                    "notification.tag": 1,
                    "notification.tittle": 1,
                    "notification.description": 1,
                    "notification.limit": 1,
                }
            },
        ]);
        return events;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = {
    search,
    getTags,
    getEventByDate,
    getRestOfEvents,
};

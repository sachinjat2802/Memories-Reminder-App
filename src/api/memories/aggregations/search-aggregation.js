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
        ]);
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
                  from          : 'users',
                  localField    : 'belongs_to',
                  foreignField  : 'email',
                  as            : 'userData'
                },
            },
            {
                $project: {
                    image: 0,
                    "userData.__v": 0,
                    "userData.dob": 0,
                    "userData.email": 0,
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
            }
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
};

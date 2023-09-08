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
                    // belongs_to: 0,
                    // email: 0,
                    // tittle: 0,
                    // description: 0,
                    image: 0,
                    event_date: 0,
                    last_notification_sent: 0,
                },
            }
        ]);
        return data;
    } catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = {
    search,
    getTags,
};

const { getTags } = require("../memories/memory-controller");
const User = require("./user-model");

const getNotificationSettings = async (req, res) => {
    try {
        const { email } = req.user;
        const foundUser = await User.findOne({ email });
        return res.status(200).json({
            message: "Notification status fetched.",
            status: 1,
            data: foundUser["notification"],
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Errror getting the document.",
            status: 0,
            error: e.message,
        });
    }
}

const updateNotificationSettings = async (req, res) => {
    try {
        const { user, body } = req;
        const { email } = user;
        const { limit, repeat, onEventOnly } = body;
        await User.updateOne(
            { email },
            {
                $set: {
                    "notification.limit": limit,
                    "notification.repeat": repeat,
                    "notification.only_date_of_event": onEventOnly,
                }
            }
        );
        return res.status(200).json({
            message: "Notification status updated.",
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Errror getting the document.",
            status: 0,
            error: e.message,
        });
    }
}

const toggleSMS = async (req, res) => {
    try {
        const { email } = req.user;
        const foundUser = await User.findOne({ email });
        const flag = !foundUser["notification"]["enabled"];
        await User.updateOne(
            { email },
            {
                $set: {
                    "notification.enabled": flag,
                }
            },
        );
        return res.status(200).json({
            message: `${flag ? "Enabled" : "Disabled"} Notification.`,
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Errror getting the document.",
            status: 0,
            error: e.message,
        });
    }
}

const addTagFilter = async (req, res) => {
    try {
        const { user, body } = req;
        const { email } = user;
        const { tags, filterMatch } = body;
        if (!tags)
            return res.status(400).json({
                message: "Enter tags (eg: 'nature, evironment') and filterMatch: (eg: ALL or ANY or EXACT).",
                status: 0,
            });
        const tagsSplited = getTags(tags);
        await User.updateOne(
            { email },
            {
                $set: {
                    "notification.filters.tag": {
                        tags: tagsSplited,
                        filter_match: filterMatch,
                        enabled: true,
                    }
                }
            }
        );
        return res.status(200).json({
            message: `Filter added successfully.`,
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Errror getting the document.",
            status: 0,
            error: e.message,
        });
    }
}

const deleteTagFilter = async (req, res) => {
    try {
        const { user } = req;
        const { email } = user;
        await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    "notification.filters.tag": {
                        tags: [],
                        enabled: false,
                    }
                }
            }
        );
        return res.status(200).json({
            message: `Filter removed successfully.`,
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Errror removing filter.",
            status: 0,
            error: e.message,
        });
    }
}

const addTittleFilter = async (req, res) => {
    try {
        const { user, body } = req;
        const { email } = user;
        const { tittles } = body;
        if (!tittles)
            return res.status(400).json({
                message: "Enter tittles (eg: 'nature, evironment').",
                status: 0,
            });
        const tagsSplited = getTags(tittles);
        await User.updateOne(
            { email },
            {
                $set: {
                    "notification.filters.tittle": {
                        tittles: tagsSplited,
                        enabled: true,
                    }
                }
            }
        );
        return res.status(200).json({
            message: `Filter added successfully.`,
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Errror adding filter.",
            status: 0,
            error: e.message,
        });
    }
}

const deleteTittleFilter = async (req, res) => {
    try {
        const { email } = req.user;
        await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    "notification.filters.tittle": {
                        tittles: [],
                        enabled: false,
                    }
                }
            }
        );
        return res.status(200).json({
            message: `Filter removed successfully.`,
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Errror removing filter.",
            status: 0,
            error: e.message,
        });
    }
}

const addImageFilter = async (req, res) => {
    try {
        const { user, body } = req;
        const { email } = user;
        const { status } = body;
        if (!status)
            return res.status(400).json({
                message: "Enter status: (eg: HAS_IMAGE or NO_IMAGE).",
                status: 0,
            });
        await User.updateOne(
            { email },
            {
                $set: {
                    "notification.filters.image": {
                        status,
                        enabled: true,
                    }
                }
            }
        );
        return res.status(200).json({
            message: `Filter added successfully.`,
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Errror adding filter.",
            status: 0,
            error: e.message,
        });
    }
}

const deleteImageFilter = async (req, res) => {
    try {
        const { email } = req.user;
        await User.findOneAndUpdate(
            { email },
            {
                $set: {
                    "notification.filters.image": {
                        enabled: false,
                    }
                }
            }
        );
        return res.status(200).json({
            message: `Filter removed successfully.`,
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Errror removing filter.",
            status: 0,
            error: e.message,
        });
    }
}

module.exports = {
    addTagFilter,
    deleteTagFilter,

    addTittleFilter,
    deleteTittleFilter,

    addImageFilter,
    deleteImageFilter,

    getNotificationSettings,
    updateNotificationSettings,

    toggleSMS,
}
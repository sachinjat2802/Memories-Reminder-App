const {  getANotification, getAllNotifications, save, removeNotification } = require("./notification-service");

const getNotification = async (req, res) => {
    try {
        const { user, params } = req; 
        const { email } = user;
        const { id } = params;
        const data = await getANotification(id, email);
        return res.status(200).json({
            message: "Successfully retrived notification.",
            status: 1,
            data,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong.",
            status: 0,
            error: e.message,
        });
    }
}

const getNotifications = async (req, res) => {
    try {
        const { email } = req.user;
        const data = await getAllNotifications(email);
        return res.status(200).json({
            message: "Successfully retrived notifications.",
            status: 1,
            data,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong.",
            status: 0,
            error: e.message,
        });
    }
}

const saveNotification = async (req, res) => {
    try {
        const { user, body } = req; 
        const { email } = user;
        await save(body, email);
        return res.status(200).json({
            message: "Successfully saved notification.",
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong.",
            status: 0,
            error: e.message,
        });
    }
}

const deleteNotification = async (req, res) => {
    try {
        const { user, params } = req; 
        const { email } = user;
        const { id } = params;
        await removeNotification(id, email);
        return res.status(200).json({
            message: "Successfully deleted notification.",
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong.",
            status: 0,
            error: e.message,
        });
    }
}

module.exports = {
    getNotification,
    getNotifications,
    saveNotification,
    deleteNotification,
}

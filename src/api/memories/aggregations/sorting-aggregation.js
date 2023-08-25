const Memory = require("../memory-model");

const sortByEventDate = async (email) => {
    try {
        const datas = await Memory.aggregate([
            {
                $match: {
                    belongs_to: email
                },
                $sort: { event_date: -1 }
            }
        ]);
        return datas;
    } catch(e) {
        console.log(e);
        throw e;
    }
}

const sortByCreatedDate = async () => {
    try {
        const datas = await Memory.aggregate([
            {
                $match: {
                    belongs_to: email
                },
                $sort: { createdAt: -1 }
            }
        ]);
        return datas;
    } catch(e) {
        console.log(e);
        throw e;
    }
}

const sortByLastSentDate = async () => {
    try {
        const datas = await Memory.aggregate([
            {
                $match: {
                    belongs_to: email
                },
                $sort: { last_notification_sent: -1 }
            }
        ]);
        return datas;
    } catch(e) {
        console.log(e);
        throw e;
    }
}

module.exports = {
    sortByEventDate,
    sortByCreatedDate,
    sortByLastSentDate,
}

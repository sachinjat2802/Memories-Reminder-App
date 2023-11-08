const Memory = require("../api/memories/memory-model");
const { sendMail } = require("./email-service");
const { sortingAggregations, searchAggregations } = require("../api/memories/aggregations");
const UserModel = require("../api/user/user-model")
const NotificationModel = require("../api/notification/notification-model")
const MemoryModel = require("../api/memories/memory-model")

const date = new Date();

const sendNotificationToUser = async () => {
    let userCount = await UserModel.find({}).count();

    let skip = 0;
    const limit =10

    for(let i=0;i<userCount;i+=limit){
        let userList = UserModel.find({}).skip(i).limit(limit);
        for(let j=0; j<userList.length;j++){
            let user = userList[j];
            let notificationsRules = await NotificationModel.find({belongs_to: user._id});
            let memories=[];
            let limit =0;
            for(let k=0;k<notificationsRules.length;k++){
                let notificationRule =  notificationsRules[k];
                limit += notificationRule.limit;
                const currentDate = new Date();
                let startDate = new Date(currentDate);
                startDate.setDate(currentDate.getDate() - notificationRule.repeat)
                startDate.setHours(0,0,0,0);
                let endDate = new Date(currentDate);
                endDate.setHours(23,59,59,999);
                let memorieList = await MemoryModel.find({
                    event_date: {
                        $lte: endDate
                    },
                    event_date: {
                        $gte: startDate
                    },
                    belongs_to: user.email
                })
                for(let l=0;l<memorieList.length;l++){
                    if(notificationRule?.tag?.filter_match == "Has any of"){
                        if(hasAnyOfTag(memorieList[l].tags,notificationRule.tag.tags)){
                            memories.push(memorieList[l]);
                        }

                    }else if(notificationRule?.tag?.filter_match == "Has all of"){
                        if(hasAllOfTag(memorieList[l].tags,notificationRule.tag.tags)){
                            memories.push(memorieList[l]);
                        }
    
                    }else if(notificationRule?.tag?.filter_match == "Has exactly"){
                        if(hasExactTag(memorieList[l].tags,notificationRule.tag.tags)){
                            memories.push(memorieList[l]);
                        }
                    }else if(notificationRule?.tag?.filter_match == "Untagged"){
                        if(memorieList[l].tags.length == 0){
                            memories.push(memorieList[l]);
                        }
                    }
                }

            }

            if(user.enabled_notification){
                const currentDate = new Date();
                let startDate = new Date(currentDate);
                startDate.setDate(currentDate.getDate() - 30)
                startDate.setHours(0,0,0,0);
                let endDate = new Date(currentDate);
                endDate.setHours(23,59,59,999);
                let memorieList = await MemoryModel.find({
                    event_date: {
                        $lte: endDate
                    },
                    event_date: {
                        $gte: startDate
                    },
                    belongs_to: user.email
                })
                memories = [...memories, ...memorieList];
            }

            if(limit !=0){
                memories.slice(0, limit);
            }

            sendNotificationWithDelay(memories, user);
            
        }
    }
}

const hasExactTag = async (memoryTag, notificationTag) => {
    if(memoryTag.length != notificationTag.length){
        return false;
    }
    memoryTag.sort();
    notificationTag.sort();
    for(let i=0;i<memoryTag.length;i++){
        if(memoryTag[i]!=notificationTag[i]){
            return false;
        }
    }

    return true;
}

const hasAllOfTag = async (memoryTag, notificationTag) => {
    if(memoryTag.length < notificationTag.length){
        return false;
    }
    for(let i=0;i<notificationTag.length;i++){
        if(!memoryTag.includes(notificationTag[i])){
            return false;
        }
    }

    return true;
}

const hasAnyOfTag = async (memoryTag, notificationTag) => {
    if(memoryTag.length == 0){
        return false;
    }
    for(let i=0;i<notificationTag.length;i++){
        if(memoryTag.includes(notificationTag[i])){
            return true;
        }
    }

    return false;
}

const sendNotificationWithDelay = async (memories, user) => {
    for(let i=0;i<memories.length;i++){
        const reciptant = user["belongs_to"];
        const todaysDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${(date.getDate()).toString().padStart(2, "0")}`;
        await sendMail(reciptant, `Remainder of ${memories[i]["tittle"]}`, `This is to notify about "${memories[i]["tittle"]}". `);

        var count = 1;
        if (memories[i]["mails_count"])
            count = memories[i]["mails_count"] + 1;
        await Memory.updateOne(
            { _id: memories[i]["_id"] },
            {
                $set: {
                    mails_count: count,
                    last_notification_sent: new Date(todaysDate),
                }
            }
        );
    }
}

const sendNotification = async () => {
    let uniqueMailId = [];
    const notTodaysEvent = await getEventExceptTodays();
    for (const event of notTodaysEvent) {
        if (event["notification"].length > 0) {

            for (const notifi of event["notification"]) {

                if (event["last_notification_sent"]) {

                    console.log("knkjhbj", event, notifi);
                    const diff = calculateDateDifference(event["last_notification_sent"]);
                    const repeat = notifi["repeat"];
                    console.log(event["mails_count"], notifi["limit"]);

                    if (event["mails_count"] <= notifi["limit"]) {

                        if (notifi["tittle"]) {
                            if (notifi["tittle"]["tittles"]) {
                                console.log(notifi["tittle"]["tittles"], event["tittle"]);
                                if (notifi["tittle"]["tittles"].indexOf(event["tittle"]) > -1 && notifi["tittle"]["enabled"]) {
                                    await sendEventMail(event);
                                }
                            }
                        }

                        if (notifi["description"]) {
                            if (notifi["description"]["descriptions"]) {
                                console.log(notifi["description"]["descriptions"], event["description"]);
                                if (notifi["description"]["descriptions"].indexOf(event["description"]) > -1 && notifi["description"]["enabled"]) {
                                    await sendEventMail(event);
                                }
                            }
                        }

                        if (notifi["image"]) {
                            if (notifi["image"]["enabled"]) {
                                if (notifi["image"]["status"] == "Has images") {
                                    if (event["image"] && event["image"].length > 0) {
                                        console.log("====>", notifi["image"], event["image"].length);
                                        await sendEventMail(event);
                                    }
                                }
                                if (notifi["image"]["status"] == "Doesnt have images") {
                                    if (event["image"] && event["image"].length == 0) {
                                        console.log("jnjknkjnkjhjhj", notifi["image"], event);
                                        await sendEventMail(event);
                                    }
                                }
                            }
                        }

                        if (notifi["tag"]) {
                            if (notifi["tag"]["tags"] && notifi["tag"]["enabled"]) {
                                console.log(notifi["tag"]["tags"], event["tags"]);
                                if (notifi["tag"]["filter_match"] == "Has all of") {
                                    if (notifi["tag"]["tags"][0].every(item => event["tags"].includes(item))) {
                                        await sendEventMail(event);
                                    }
                                }

                                if (notifi["tag"]["filter_match"] == "Has exactly") {
                                    const notificationTags = notifi["tags"];
                                    console.log("mhghggh", notificationTags[0]);
                                    const conditionMet = arraysHaveExactMatch(notificationTags[0], event["tags"]);
                                    if (conditionMet) {
                                        await sendEventMail(event);
                                    }
                                }

                                if (notifi["tag"]["filter_match"] == "Has any of") {
                                    const notificationTags = notifi["tags"];
                                    console.log("mhghggh", notificationTags[0]);
                                    const conditionMet = arraysHasAnyOf(notificationTags[0], event["tags"]);
                                    if (conditionMet) {
                                        await sendEventMail(event);
                                    }
                                }
                            }
                        }
                    } else {
                        // if (diff >= (repeat - 1)) {
                        console.log("diff ", diff, "repeat ", repeat);
                        if ((diff + 1) == repeat && notifi["limit"] > 0) {
                            await Memory.findOneAndUpdate(
                                {
                                    _id: event["_id"],
                                },
                                {
                                    $set: {
                                        mails_count: 0,
                                    }
                                }
                            );
                        }
                    }
                } else {
                    await sendEventMail(event);
                }
            }
        } else {
            const returnV = await sendIfNotSentToday(event);
            console.log(returnV);
        }
    }

    const todaysEvent = await getTodaysEvent();
    for (const event of todaysEvent) {
        for (let notifi of event["notification"]) {
            if (notifi["tittle"]) {
                if (notifi["tittle"]["tittles"]) {
                    console.log(notifi["tittle"]["tittles"], event["tittle"]);
                    if (notifi["tittle"]["tittles"].indexOf(event["tittle"]) > -1 && notifi["tittle"]["enabled"]) {
                        await sendEventMail(event);
                    }
                }
            }

            if (notifi["description"]) {
                if (notifi["description"]["descriptions"]) {
                    console.log(notifi["description"]["descriptions"], event["description"]);
                    if (notifi["description"]["descriptions"].indexOf(event["description"]) > -1 && notifi["description"]["enabled"]) {
                        await sendEventMail(event);
                    }
                }
            }

            if (notifi["image"]) {
                if (notifi["image"]["enabled"]) {
                    if (notifi["image"]["status"] == "Has images") {
                        if (event["image"] && event["image"].length > 0) {
                            console.log("====>", notifi["image"], event["image"].length);
                            await sendEventMail(event);
                        }
                    }
                    if (notifi["image"]["status"] == "Doesnt have images") {
                        if (event["image"] && event["image"].length == 0) {
                            console.log("jnjknkjnkjhjhj", notifi["image"], event);
                            await sendEventMail(event);
                        }
                    }
                }
            }

            if (notifi["tag"]) {
                if (notifi["tag"]["tags"] && notifi["tag"]["enabled"]) {
                    console.log("==>", event["tags"]);
                    if (notifi["tag"]["filter_match"] == "Has all of") {
                        if (notifi["tag"]["tags"][0].every(item => event["tags"].includes(item))) {
                            await sendEventMail(event);
                        }
                    }

                    if (notifi["tag"]["filter_match"] == "Has exactly") {
                        const notificationTags = notifi["tags"];
                        console.log("mhghggh", notificationTags[0]);
                        const conditionMet = arraysHaveExactMatch(notificationTags[0], event["tags"]);
                        if (conditionMet) {
                            await sendEventMail(event);
                        }
                    }
                    
                    if (notifi["tag"]["filter_match"] == "Has any of") {
                        const notificationTags = notifi["tags"];
                        const conditionMet = arraysHasAnyOf(notificationTags[0], event["tags"]);
                        console.log("conditionMet 2 ", conditionMet);
                        if (conditionMet) {
                            await sendEventMail(event);
                        }
                    }

                    if (notifi["tag"]["filter_match"] == "Untagged") {
                        const conditionMet = event["tags"].length == 0;
                        if (conditionMet) {
                            await sendEventMail(event);
                        }
                    }
                }
            }
        };
    }
}

const sendIfNotSentToday = async (memory) => {
    try {
        if (!memory["last_notification_sent"]) {
            await sendEventMail(memory);
        } else {
            const diff = calculateDateDifference(memory["last_notification_sent"]);
            console.log(diff);
            if (diff > -1)
                await sendEventMail(memory);
        }
    } catch (e) {
        console.log(e);
    }
}

const sendEventMail = async (event) => {
    console.log("===>", event);
    const reciptant = event["belongs_to"];
    const todaysDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${(date.getDate()).toString().padStart(2, "0")}`;
    // if (!uniqueMailId.includes(reciptant)) {
    await sendMail(reciptant, `Remainder of ${event["tittle"]}`, `This is to notify about "${event["tittle"]}". `);

    var count = 1;
    if (event["mails_count"])
        count = event["mails_count"] + 1;

    console.log("count ", count);
    await Memory.updateOne(
        { _id: event["_id"] },
        {
            $set: {
                mails_count: count,
                last_notification_sent: new Date(todaysDate),
            }
        }
    );
    return reciptant;
    // uniqueMailId.push(reciptant);
    // }
}

const getTodaysEvent = async () => {
    const events = await searchAggregations.getEventByDate(date.getDate(), date.getMonth() + 1);
    return events;
}

const getEventExceptTodays = async () => {
    const events = await searchAggregations.getRestOfEvents(date.getDate(), date.getMonth() + 1);
    return events;
}

function arraysHaveExactMatch(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    return arr1.every((element, index) => element === arr2[index]);
}

function arraysHasAnyOf(arr1, arr2) {
    // console.log("conditionMet: ", JSON.parse(arr1));
    for (const element1 of arr1) {
        for (const element2 of arr2) {
            console.log(element1, element2);
            if (element1 == element2) {
                return true; // Found a matching element
            }
        }
    }
    return false; // No matching elements found
}

const calculateDateDifference = (dateString) => {
    const inputDate = new Date(dateString);
    const currentDate = new Date();
    const timeDifference = inputDate - currentDate;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
}

module.exports = {
    getTodaysEvent,
    getEventExceptTodays,
    sendNotification,
    sendNotificationToUser
}

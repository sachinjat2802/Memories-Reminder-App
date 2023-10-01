const Memory = require("./memory-model");
const { validationService } = require("../../services");
const { searchAggregations, sortingAggregations } = require("./aggregations");

const createMemory = async (req, res) => {
    try {
        const { files, body, user } = req;
        const { email } = user;
        const { tittle, description, tags = [], dateOfEvent } = body;
        if (!description)
            return res.status(400).json({
                message: "Enter description",
                status: 0,
            });
        if (!validationService.isValidEmail(email))
            return res.status(400).json({
                message: "Enter an valid email address...",
                status: 0,
            });
        const images = fileToBuffer(files);
        const finalTags = getTags(tags);
        await Memory.create({
            belongs_to: email,
            tittle,
            description,
            tags: finalTags,
            event_date: dateOfEvent,
            image: images,
        });
        return res.status(201).json({
            message: "Successfully created Memory...",
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong.",
            status: 0,
            error: e.message
        });
    }
}

const updateMemory = async (req, res) => {
    try {
        const { user, files, body } = req;
        const { email } = user;
        const { id, tittle, description, tags = [], dateOfEvent } = body;
        if (!id || !description)
            return res.status(400).json({
                message: "Enter id, description",
                status: 0,
            });
        if (!validationService.isValidEmail(email))
            return res.status(400).json({
                message: "Enter an valid email address...",
                status: 0,
            });
        const images = fileToBuffer(files);
        const finalTags = getTags(tags);
        const { matchedCount } = await Memory.updateOne(
            {
                _id: id,
                belongs_to: email,
            },
            {
                $push: { image: images, },
                $set: {
                    tittle,
                    description,
                    tags: finalTags,
                    event_date: dateOfEvent,
                }
            },
        );
        if (matchedCount == 0)
            return res.status(404).json({
                message: "Memory does not exist...",
                status: 0,
                error: "Invalid memory id."
            });
        const imagesToRemove = body["imgToRemove"];
        if(imagesToRemove) {
            let memory = await Memory.findOne({
                _id: id,
                belongs_to: email,
            });
            if(memory["image"].length > 0) {
                memory["image"] = memory["image"].filter(image => (imagesToRemove.indexOf(image["_id"]) < 0));
                await memory.save();
            }
        }
        return res.status(201).json({
            message: "Successfully updated Memory...",
            status: 1,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong.",
            status: 0,
            error: e.message
        });
    }
}

const getAllMemories = async (req, res) => {
    try {
        const { email } = req.user;
        const memories = await Memory.find({ belongs_to: email });
        return res.status(200).json({
            message: "Here are your memories...",
            status: 1,
            data: memories,
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

const getAllMemoriesSorted = async (req, res) => {
    try {
        const { email } = req.user;
        const { sortBy } = req.params;
        var memories;
        if (sortBy == "created")
            memories = await sortingAggregations.sortByCreatedDate(email);
        else if (sortBy == "event")
            memories = await sortingAggregations.sortByEventDate(email);
        else
            memories = await sortingAggregations.sortByLastSentDate(email);
        return res.status(200).json({
            message: "Here are your memories...",
            status: 1,
            data: memories,
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

const searchMemory = async (req, res) => {
    try {
        const { email } = req.user;
        const { searchText } = req.params;
        const data = await searchAggregations.search(email, searchText);
        return res.status(200).json({
            message: "Here are your memories...",
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

const getAMemory = async (req, res) => {
    try {
        const { email } = req.user;
        const { id } = req.params;
        const memories = await Memory.find({ _id: id, belongs_to: email });
        return res.status(200).json({
            message: "Here is your memory...",
            status: 1,
            data: memories,
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

const getTagsSuggestion = async (req, res) => {
    try {
        const { email } = req.user;
        const { name } = req.params;
        const tags = await searchAggregations.getTags(email, name);
        let suggestions = [];
        tags.map(memories => {
            memories["tags"].map(tag => {
                if (tag.includes(name) && !suggestions.includes(tag))
                    suggestions.push(tag);
            });
        });
        if (name == "!0000" || suggestions.length == 0) {
            const foundMemory = await Memory.find({ belongs_to: email });
            foundMemory.map(memories => {
                memories["tags"].map(tag => {
                    if (!suggestions.includes(tag))
                        suggestions.push(tag);
                });
            });
        }
        return res.status(200).json({
            message: "Tags sugeestion.",
            status: 1,
            data: suggestions,
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

//////////////////////////// Helper Functions
const fileToBuffer = (files) => {
    var images = [];
    if (files) {
        const inCommingFile = files["file"];
        const isArray = Array.isArray(inCommingFile);
        if (isArray)
            for (const file of inCommingFile)
                images.push({
                    name: file.name,
                    data: Buffer.from(file.data),
                    contentType: "image/jpeg",
                });
        else
            images.push({
                name: inCommingFile.name,
                data: Buffer.from(inCommingFile.data),
                contentType: "image/jpeg",
            });
    };
    return images;
}

const getTags = (tags) => {
    let finalTags = [];
    if (tags.length != 0)
        finalTags = tags.split(",");
    return finalTags;
}

module.exports = {
    createMemory,
    updateMemory,
    getAllMemories,
    getAllMemoriesSorted,
    searchMemory,
    getAMemory,
    getTagsSuggestion,

    //////////////////////////// Helper Functions
    fileToBuffer,
    getTags,
}

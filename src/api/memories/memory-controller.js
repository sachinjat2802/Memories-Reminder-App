const Memory = require("./memory-model");
const { validationService, fileService } = require("../../services");
const { searchAggregations, sortingAggregations } = require("./aggregations");

const createMemory = async (req, res) => {
    try {
        const { files, body, user } = req;
        const { email } = user;
        const { tittle, description, tags = [], dateOfEvent } = body;
        if (!tittle && !description)
            return res.status(400).json({
                message: "Tittle or Description is mandatory.",
                status: 0,
            });
        if (!validationService.isValidEmail(email))
            return res.status(400).json({
                message: "Enter an valid email address...",
                status: 0,
            });
        const images = await fileToBuffer(files);
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
        const { id, tittle, description, tags = [], dateOfEvent, imgToRemove } = body;
        if (!id)
            return res.status(400).json({
                message: "Enter id to update",
                status: 0,
            });
        if (!tittle && !description)
            return res.status(400).json({
                message: "Tittle or Description is mandatory.",
                status: 0,
            });
        if (!validationService.isValidEmail(email))
            return res.status(400).json({
                message: "Enter an valid email address...",
                status: 0,
            });
        const images = await fileToBuffer(files);
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
        if (imgToRemove) {
            let memory = await Memory.findOne({
                _id: id,
                belongs_to: email,
            });
            if (memory["image"].length > 0) {
                memory["image"] = memory["image"].filter((image) => {
                    console.log(imgToRemove.indexOf(image["_id"]) < 0);
                    if (imgToRemove.indexOf(image["_id"]) < 0)
                        return true;
                    else {
                        try {
                            fileService.deleteAFileFromPath(image["path"]);
                        } catch (e) {
                            console.log(e);
                        }
                        return false;
                    }
                });
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
        console.log(req.query);
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;
        const memories = await Memory.find({
            belongs_to: email,
        })
        .skip(skip)
        .limit(parseInt(limit));
        const data = await memoriesImagesConverter(memories);
        console.log(JSON.stringify(data));
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
        const memories = await memoriesImagesConverter(data);
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

const getAMemory = async (req, res) => {
    try {
        const { email } = req.user;
        const { id } = req.params;
        const memories = await Memory.find({ _id: id, belongs_to: email });
        const data = await memoriesImagesConverter(memories);
        return res.status(200).json({
            message: "Here is your memory...",
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

const deleteMemory = async (req, res) => {
    try {
        const { user, params } = req;
        const { email } = user;
        const { id } = params;
        await Memory.deleteOne({ belongs_to: email, _id: id });
        return res.status(200).json({
            message: "Memory Deleted.",
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

//////////////////////////// Helper Functions
const fileToBuffer = async (files) => {
    var images = [];
    if (files) {
        const inCommingFile = files["file"];
        const isArray = Array.isArray(inCommingFile);
        if (isArray)
            for (const file of inCommingFile) {
                const storedPath = await fileService.saveBufferToDisk(Buffer.from(file.data), file.name);
                images.push({
                    name: file.name,
                    path: storedPath,
                    contentType: "image/jpeg",
                });
            }
        else {
            const storedPath = await fileService.saveBufferToDisk(Buffer.from(inCommingFile.data), inCommingFile.name);
            console.log("storedPath: ", storedPath);
            images.push({
                name: inCommingFile.name,
                path: storedPath,
                contentType: "image/jpeg",
            });
        }
    };
    return images;
}

const dbImageToFileBuffer = async (dbImages) => {
    let images = [];
    if (dbImages) {
        for (const image of dbImages) {
            const buffer = await fileService.readFileToBuffer(image.path);
            images.push({
                _id: image["_id"],
                name: image.name,
                data: buffer,
                contentType: image.contentType,
            });
        }
    }
    return images;
}

const memoriesImagesConverter = async (memories) => {
    var returnMemories = [];
    if (memories) {
        for (let memory of memories) {
            const images = await dbImageToFileBuffer(memory["image"]);
            returnMemories.push({
                _id: memory["_id"],
                belongs_to: memory["belongs_to"],
                tittle: memory["tittle"],
                description: memory["description"],
                tags: memory["tags"],
                event_date: memory["event_date"],
                image: images,
            });
        }
    }
    return returnMemories;
}

const getTags = (tags) => {
    let finalTags = [];
    if (tags.length != 0) {
        let splitted = tags.split(",");
        for (let tag of splitted) {
            finalTags.push(tag.trim());
        }
    }
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
    deleteMemory,

    //////////////////////////// Helper Functions
    fileToBuffer,
    dbImageToFileBuffer,
    getTags,
}

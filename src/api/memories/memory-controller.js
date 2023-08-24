const Memory = require("./memory-model");
const { validationService } = require("../../services");

const createMemory = async (req, res) => {
    const { email } = req.user;
    const { tittle, description, tags = [], dateOfEvent } = req.body;
    if (!tittle || !description || !dateOfEvent)
        return res.status(400).json({
            message: "Enter tittle, description, dateOfEvent",
            status: 0,
        });
    if (!validationService.isValidEmail(email))
        return res.status(400).json({
            message: "Enter an valid email address...",
            status: 0,
        });
    await Memory.create({
        belongs_to: email,
        tittle,
        description,
        tags: tags.split(","),
        event_date: dateOfEvent,
        image: {
            name: req.files.file.name,
            data: Buffer.from(req.files.file.data),
            contentType: "image/jpeg",
        }
    });
    return res.status(201).json({
        message: "Successfully created Memory...",
        status: 1,
    });
}

const updateMemory = async (req, res) => {
    const { email } = req.user;
    const { id, tittle, description, tags = [], dateOfEvent } = req.body;
    if (!id || !tittle || !description || !dateOfEvent)
        return res.status(400).json({
            message: "Enter id, tittle, description, dateOfEvent",
            status: 0,
        });
    if (!validationService.isValidEmail(email))
        return res.status(400).json({
            message: "Enter an valid email address...",
            status: 0,
        });
    const { matchedCount } = await Memory.updateOne(
        {
            _id: id,
            belongs_to: email,
        },
        {
            $set: {
                tittle,
                description,
                tags: tags.split(","),
                event_date: dateOfEvent,
                image: {
                    name: req.files.file.name,
                    data: Buffer.from(req.files.file.data),
                    contentType: "image/jpeg",
                }
            }
        }
    );
    if (matchedCount == 0)
        return res.status(404).json({
            message: "Memory does not exist...",
            status: 0,
            error: "Invalid memory id."
        });
    return res.status(201).json({
        message: "Successfully updated Memory...",
        status: 1,
    });
}

const getAllMemories = async (req, res) => {
    const { email } = req.user;
    const memories = await Memory.find({ belongs_to: email });
    return res.status(200).json({
        message: "Here are your memories...",
        status: 1,
        data: memories,
    });
}

const getAMemory = async (req, res) => {
    const { email } = req.user;
    const { id } = req.params;
    const memories = await Memory.find({ _id: id, belongs_to: email });
    return res.status(200).json({
        message: "Here is your memory...",
        status: 1,
        data: memories,
    });
}

module.exports = {
    createMemory,
    updateMemory,
    getAllMemories,
    getAMemory,
}

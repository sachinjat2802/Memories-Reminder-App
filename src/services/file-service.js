const fs = require('fs/promises');
const filesys = require("fs");
const path = require('path');
const { PORT, HOST } = require('../config');

const readFileToBuffer = async (filePath) => {
    try {
        // const buffer = await fs.readFile(filePath);

        return `${HOST}:${PORT}/${filePath}`;
    } catch (error) {
        throw error;
    }
}

const saveBufferToDisk = async (buffer, defaultFileName) => {
    try {
        // Generate a unique file name (e.g., using a timestamp and random number)
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}_${defaultFileName}`;

        // Define the file path where you want to save the file
        const filePath = path.join(__dirname, '../../files', fileName);

        // Write the buffer to the file
        await fs.writeFile(filePath, buffer);

        return fileName;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const deleteAFileFromPath = (filePath) => {
    try {
        filesys.rmSync(filePath);
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    readFileToBuffer,
    saveBufferToDisk,
    deleteAFileFromPath,
}

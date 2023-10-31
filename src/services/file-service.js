const AWS = require('aws-sdk');

const s3 = new AWS.S3({
    accessKeyId: 'AKIA2Y7GDWJQHYRAZGMY',
    secretAccessKey: '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',
    region: 'ap-south-1'
});

const readFileToBuffer = async (filePath) => {
    try {
        const params = {
            Bucket: 'revisitro',
            Key: filePath,
          };
        
          try {
              const signedUrl = await s3.getSignedUrlPromise('getObject', params);
              console.log('Signed URL: ', signedUrl);
            return signedUrl;
          } catch (error) {
            console.error('Error generating signed URL:', error);
            throw error;
          }
    } catch (error) {
        throw error;
    }
}

const saveBufferToDisk = async (buffer, defaultFileName) => {
    try {
        const fileName = `production/${Date.now()}_${Math.floor(Math.random() * 10000)}_${defaultFileName}`;
        const params = {
            Bucket: 'revisitro',
            Key: fileName,
            Body: buffer
        };
        const data = await s3.upload(params).promise();
        console.log(data,"/////////////////////////////////");
        return data.Key;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const deleteAFileFromPath = async (filePath) => {
    try {
        const params = {
            Bucket: 'revisitro',
            Key: filePath
        };
        await s3.deleteObject(params).promise();
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    readFileToBuffer,
    saveBufferToDisk,
    deleteAFileFromPath,
}

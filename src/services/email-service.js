const axios = require("axios");
const MAIL_URL = "http://localhost:8000/mail/send";


const generateOTO = () => {
    const randomNumber = Math.floor(Math.random() * 10000);
    const fourDigitNumber = randomNumber.toString().padStart(4, '0');
    return fourDigitNumber;
}

const sendMail = async (to, subject, body) => {
    const mailBody = {
        reciptant: to,
        subject,
        body,
    };
    const { status } = await axios.post(MAIL_URL, mailBody);
    if (status == 200)
        console.info(`mail sent to user ${to}`);
};

const sendOTP = async (to) => {
    const otp = generateOTO();
    const mailBody = {
        reciptant: to,
        subject: "OTP for Memory App",
        body: `Hi this is your OTP ${otp} to login to memory app.`,
    };
    const { status } = await axios.post(MAIL_URL, mailBody);
    if (status == 200)
        console.info(`OTP sent to user ${to}`);
    return otp;
};

module.exports = {
    sendMail,
    sendOTP,
}

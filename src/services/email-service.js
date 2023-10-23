const { createTransport } = require("nodemailer");
const { MAILID, MAIL_USER, MAIL_PASSWORD } = require("../config/index");


const transporter = createTransport({
    host: 'email-smtp.us-east-1.amazonaws.com',
    port: 587, // Standard SMTP port (can be different based on your provider)
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD
    }
});

const generateOTP = () => {
    const randomNumber = Math.floor(Math.random() * 10000);
    const fourDigitNumber = randomNumber.toString().padStart(4, '0');
    return fourDigitNumber;
}

const sendMail = async (to, subject, body) => {
    try {
        const mailBody = {
            from: MAILID,
            to,
            subject,
            text: body,
        };
        await transporter.sendMail(mailBody)
    } catch (e) {
        console.log(e);
    }
};

const sendOTP = async (to) => {
    const otp = generateOTP();
    try {
        const mailBody = {
            from: MAILID,
            to,
            subject: "Your OTP",
            text: `Your OTP to login Memory App is: ${otp}`,
        };
        await transporter.sendMail(mailBody);
    } catch (e) {
        console.log(e);
    }
    return otp;
};

module.exports = {
    sendMail,
    sendOTP,
}

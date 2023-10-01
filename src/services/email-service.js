const { createTransport } = require("nodemailer");
const { MAILID, MAIL_PASSWORD } = require("../config/index");


const transporter = createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    secureConnection: false,
    auth: {
        user: MAILID,
        pass: MAIL_PASSWORD,
    },
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
        // transporter.sendMail(mailBody, (error, info) => {
        //     if (error) {
        //         console.info(`Error sending mail to user ${to}`);
        //         console.log(error);
        //     } else {
        //         console.info(`mail sent to user ${to}`);
        //     }
        // });
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
        // transporter.sendMail(mailBody, (error, info) => {
        //     if (error) {
        //         console.info(`Error sending mail to user ${to}`);
        //         console.log(error);
        //     } else {
        //         console.info(`mail sent to user ${to}`);
        //     }
        // });
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

const { createTransport } = require("nodemailer");
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: 'AKIA2Y7GDWJQGW77WIUP', // Replace with your AWS access key
    secretAccessKey: '6QhB7d6bIYsrzU6d7Svt4ptfDHwrCtJpyj5EVzZT', // Replace with your AWS secret access key
    region: 'us-east-1' // Replace with your AWS region
});
  
const ses = new AWS.SES({ apiVersion: '2010-12-01' });


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
        // const mailBody = {
        //     from: MAILID,
        //     to,
        //     subject,
        //     text: body,
        // };
       
        // await transporter.sendMail(mailBody)
        // Email parameters
const params = {
    Destination: {
      ToAddresses: [to] // Replace with the recipient's email address
    },
    Message: {
      Body: {
        Text: {
          Data: body // Replace with the email body
        }
      },
      Subject: {
        Data: subject // Replace with the email subject
      }
    },
    Source: 'notificaitions@revisitro.com' // Replace with your email address
        };
        ses.sendEmail(params, (err, data) => {
  if (err) {
    console.error('Error sending email:', err);
  } else {
    console.log('Email sent successfully:', data.MessageId);
  }
});
        
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
        const params = {
            Destination: {
              ToAddresses: [mailBody.to] // Replace with the recipient's email address
            },
            Message: {
              Body: {
                Text: {
                  Data: mailBody.text // Replace with the email body
                }
              },
              Subject: {
                Data: mailBody.subject// Replace with the email subject
              }
            },
            Source: 'notificaitions@revisitro.com' // Replace with your email address
                };
          ses.sendEmail(params, (err, data) => {
            if (err) {
                console.error('Error sending email:', err);
            } else {
                console.log('Email sent successfully:', data.MessageId);
            }
        });
        // await transporter.sendMail(mailBody);
    } catch (e) {
        console.log(e);
    }
    return otp;
};





module.exports = {
    sendMail,
    sendOTP,
}

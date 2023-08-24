const User = require("./user-model");
const { emailService, validationService, authorizationService } = require("../../services");

const signUpUser = async (req, res) => {
    const { email } = req.body;
    if(!email)
        return res.status(400).json({
            message: "Enter an email...",
            status: 0,
        });
    if(!validationService.isValidEmail(email))
        return res.status(400).json({
            message: "Enter an valid email address...",
            status: 0,
        });
    const otp = await emailService.sendOTP(email);
    await User.updateOne(
        { email },
        {
            $setOnInsert: {
                email
            },
            $set: {
                otp,
                is_loggedin: false,
            }
        },
        { upsert: true }
    );
    return res.status(200).json({
        message: "Sent Opt!",
        status: 1,
    });
};

const loginUser = async (req, res) => {
    const { email, otp } = req.body;
    if(!email || !otp)
        return res.status(400).json({
            message: "Enter email and otp.",
            status: 0,
        });
    if(!validationService.isValidEmail(email))
        return res.status(400).json({
            message: "Enter an valid email address...",
            status: 0,
        });
    const { matchedCount } = await User.updateOne(
        { 
            email,
            otp,
            is_loggedin: false,
        },
        {
            $set: {
                otp: "",
                is_loggedin: true,
            }
        },
    );
    if (matchedCount == 0)
        return res.status(403).json({
            message: "OTP and email does not match...",
            status: 0,
            error: "Invalid otp or email id."
        });
    return res.status(200).json({
        message: "Logged in...!",
        status: 1,
        jwt: authorizationService.generateJWToken(email),
    });
};

module.exports = {
    signUpUser,
    loginUser,
}

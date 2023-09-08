const { hash, compare } = require("bcrypt");
const User = require("./user-model");
const Memory = require("../memories/memory-model");
const { emailService, validationService, authorizationService } = require("../../services");

const signUpWithOTP = async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({
            message: "Enter an email...",
            status: 0,
        });
    if (!validationService.isValidEmail(email))
        return res.status(400).json({
            message: "Enter an valid email address...",
            status: 0,
        });
    const otp = await emailService.sendOTP(email);
    const { matchedCount } = await User.updateOne(
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
    if (matchedCount == 0)
        return res.status(200).json({
            message: "Sent Opt!",
            status: 1,
            isNewUser: true,
        });
    return res.status(200).json({
        message: "Sent Opt!",
        status: 1,
        isNewUser: false,
    });
}

const signUpWithPassword = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({
            message: "Enter an email and password.",
            status: 0,
        });
    if (!validationService.isValidEmail(email))
        return res.status(400).json({
            message: "Enter an valid email address...",
            status: 0,
        });
    const encryptedPassword = await hash(password, 10);
    await User.updateOne(
        { email },
        {
            $setOnInsert: {
                email
            },
            $set: {
                password: encryptedPassword,
                is_loggedin: false,
            }
        },
        { upsert: true }
    );
    return res.status(200).json({
        message: "User registered successfully.",
        status: 1,
    });
}

const loginUserWithOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp)
        return res.status(400).json({
            message: "Enter email and otp.",
            status: 0,
        });
    if (!validationService.isValidEmail(email))
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
}

const loginUserWithPassword = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({
            message: "Enter email and password.",
            status: 0,
        });
    if (!validationService.isValidEmail(email))
        return res.status(400).json({
            message: "Enter an valid email address...",
            status: 0,
        });
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
        const encryptedPassword = await hash(password, 10);
        await User.updateOne(
            { email },
            {
                $setOnInsert: {
                    email
                },
                $set: {
                    password: encryptedPassword,
                    is_loggedin: false,
                }
            },
            { upsert: true }
        );
        return res.status(200).json({
            message: "Logged in...!",
            status: 1,
            jwt: authorizationService.generateJWToken(email),
            isNewUser: true,
        });
    }
    const passwordMatched = await compare(password, foundUser["password"]);
    if (!passwordMatched)
        return res.status(403).json({
            message: "Incorrect Password.",
            status: 0,
            error: "Username and password doesnot match."
        });
    return res.status(200).json({
        message: "Logged in...!",
        status: 1,
        jwt: authorizationService.generateJWToken(email),
        isNewUser: false,
    });
}

const completeProfile = async (req, res) => {
    const { email } = req.user;
    const { name, dob } = req.body;

    await User.updateOne(
        { email },
        {
            $set: {
                name,
                dob,
                profilePicture: {
                    name: req.files.file.name,
                    data: Buffer.from(req.files.file.data),
                    contentType: "image/jpeg",
                },
            }
        }
    );

    return res.status(200).json({
        message: "User profile setup completed.",
        status: 1,
    });
}

const changePassword = async (req, res) => {
    const { email } = req.user;
    const { oldPassword, newPassword } = req.body;
    const foundUser = await User.findOne({ email });
    const isPwsdMatching = await compare(oldPassword, foundUser["password"]);
    const newHashedPswd = await hash(newPassword, 10);
    if (!isPwsdMatching)
        return res.status(403).json({
            message: "The password does not match.",
            status: 0,
        });
    await User.updateOne(
        { email },
        {
            $set: {
                password: newHashedPswd,
            }
        }
    );
    return res.status(200).json({
        message: "Password changed successfully.",
        status: 1,
    });
}

const getJWT = async (req, res) => {
    const { email } = req.user;
    return res.status(200).json({
        message: "Here is JWT.",
        status: 1,
        jwt: authorizationService.generateJWToken(email),
        isNewUser: true,
    });
}

const getUserProfile = async (req, res) => {
    const { email } = req.user;
    const foundUser = await User.findOne({ email });
    if (!foundUser)
        return res.status(404).json({
            message: "User not found.",
            status: 0,
        });
    return res.status(200).json({
        message: "The user profile retrived.",
        status: 1,
        data: foundUser,
    });
}

const deleteUserProfile = async (req, res) => {
    const { email } = req.user;
    await User.deleteOne({ email });
    await Memory.deleteMany({ belongs_to: email });
    return res.status(200).json({
        message: "The user profile deleted.",
        status: 1,
    });
}

module.exports = {
    signUpWithOTP,
    signUpWithPassword,

    loginUserWithOTP,
    loginUserWithPassword,

    getUserProfile,
    completeProfile,
    deleteUserProfile,

    changePassword,
    getJWT,
}

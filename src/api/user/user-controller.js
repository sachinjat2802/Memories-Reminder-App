const { hash, compare } = require("bcrypt");
const User = require("./user-model");
const Memory = require("../memories/memory-model");
const { fileToBuffer, dbImageToFileBuffer } = require("../memories/memory-controller");
const { emailService, validationService, authorizationService } = require("../../services");

const signUpWithOTP = async (req, res) => {
    try {
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
        return res.status(200).json({
            message: "Sent Opt!",
            status: 1,
            isNewUser: matchedCount == 0,
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

const signUpWithPassword = async (req, res) => {
    try {
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
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong.",
            status: 0,
            error: e.message,
        });
    }
}

const loginUserWithOTP = async (req, res) => {
    try {
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
        const foundUser = await User.findOne({ email });
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
            isNewUser: foundUser["name"] ? false : true,
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

const loginUserWithPassword = async (req, res) => {
    try {
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
        if (!foundUser || !foundUser["password"]) {
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
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong.",
            status: 0,
            error: e.message,
        });
    }
}

const completeProfile = async (req, res) => {
    try {
        const { user, body, files } = req;
        const { email } = user;
        const { name, dob } = body;

        if (!name)
            return res.status(200).json({
                message: "Enter the name.",
                status: 0,
                error: "Missing required field name."
            });

        var profilePicture;
        if (files) {
            profilePicture = await fileToBuffer(files);
            profilePicture = profilePicture[0];
        }
        try {
            await User.updateOne(
                { email },
                {
                    $set: {
                        name,
                        dob,
                        profilePicture,
                    }
                }
            );
            return res.status(200).json({
                message: "User profile setup completed.",
                status: 1,
            });
        } catch (e) {
            return res.status(500).json({
                message: "Error updating user.",
                status: 0,
                error: e.message,
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong.",
            status: 0,
            error: e.message,
        });
    }
}

const changePassword = async (req, res) => {
    try {
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
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            message: "Something went wrong.",
            status: 0,
            error: e.message,
        });
    }
}

const getJWT = async (req, res) => {
    try {
        const { email } = req.body;
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            await User.updateOne(
                { email },
                {
                    $setOnInsert: {
                        email
                    },
                    $set: {
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
        return res.status(200).json({
            message: "Here is JWT.",
            status: 1,
            jwt: authorizationService.generateJWToken(email),
            isNewUser: false,
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

const getUserProfile = async (req, res) => {
    try {
        const { email } = req.user;
        const foundUser = await User.findOne({ email });
        var image;
        if(foundUser["profilePicture"]["name"]) {
            image = await dbImageToFileBuffer([foundUser["profilePicture"]]);
            image = image[0];
            console.log(image);
        }
        if (!foundUser)
            return res.status(404).json({
                message: "User not found.",
                status: 0,
            });
        return res.status(200).json({
            message: "The user profile retrived.",
            status: 1,
            data: {
                "profilePicture": image,
                "_id": foundUser["_id"],
                "email": foundUser["email"],
                "createdAt": foundUser["createdAt"],
                "enabled_notification": foundUser["enabled_notification"],
                "isDeleted": foundUser["isDeleted"],
                "is_loggedin": foundUser["is_loggedin"],
                "updatedAt": foundUser["updatedAt"],
                "dob": foundUser["dob"],
                "name": foundUser["name"]
            },
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

const deleteUserProfile = async (req, res) => {
    try {
        const { email } = req.user;
        await User.deleteOne({ email });
        await Memory.deleteMany({ belongs_to: email });
        return res.status(200).json({
            message: "The user profile deleted.",
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

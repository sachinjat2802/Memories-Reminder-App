const jwt = require('jsonwebtoken');
const User = require("../api/user/user-model");
const { TOKEN_SECRET } = require("../config");

const generateJWToken = (email) => jwt.sign({ email }, TOKEN_SECRET, { expiresIn: "1h" });

const authenticateUser = (req, res, next) => {
    const { authorization } = req.headers;
    jwt.verify(authorization, TOKEN_SECRET, async function(err, decoded) {
        if(err)
            return res.status(403).json({
                message: "Invalid JWt token...",
                status: 0,
                error: err.message
            });
        const { email } = decoded;
        const count = await User.countDocuments({ email });
        if(count == 0)
            return res.status(403).json({
                message: "Invalid JWt token...",
                status: 0,
                error: "There is no user exists with provided email."
            });
        req["user"] = { email };
        next();
    });
}

module.exports = {
    generateJWToken,
    authenticateUser,
}

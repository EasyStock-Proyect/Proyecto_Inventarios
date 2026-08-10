const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateAccessToken = (user) => {

    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

};

const generateRefreshToken = (user) => {

    return jwt.sign(
        {
            id: user.id,
            jti: crypto.randomUUID()
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d"
        }
    );

};

const verifyToken = (token) => {

    return jwt.verify(
        token,
        process.env.JWT_SECRET
    );

};

const verifyRefreshToken = (token) => {

    return jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET
    );

};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken
};
const { verifyToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Token no proporcionado."
        });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({
            message: "Token inválido."
        });
    }

    try {

        const decoded = verifyToken(token);

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Token expirado o inválido."
        });

    }

};

module.exports = authMiddleware;
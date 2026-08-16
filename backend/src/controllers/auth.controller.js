const authService = require("../services/auth.service")

async function register(req, res, next) {

    try {

        const user = await authService.register(req.body);

        res.status(201).json(user);

    } catch (error) {

        next(error)

    }

}

async function login(req, res, next) {

    try {

        const tokens = await authService.login(req.body);

        res
            .cookie(
                "refreshToken",
                tokens.refreshToken,
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                }
            )
            .status(200)
            .json({
                accessToken: tokens.accessToken
            });

    } catch (error) {

        next(error);

    }

}


async function getCurrentUser(req, res) {

    try {

        const user = await authService.getCurrentUser(
            req.user.id
        );


        res.json(user);


    } catch (error) {

        res.status(404).json({

            message: error.message

        });

    }

}

async function refresh(req, res, next) {

    try {

        const refreshToken = req.cookies.refreshToken;

        const tokens =
            await authService.refreshSession(
                refreshToken
            );

        res
            .cookie(
                "refreshToken",
                tokens.refreshToken,
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000
                }
            )
            .status(200)
            .json({
                accessToken: tokens.accessToken
            });

    } catch (error) {

        next(error);

    }

}

async function logout(req, res, next) {

    try {

        const refreshToken =
            req.cookies.refreshToken;

        await authService.logout(refreshToken);

        res
            .clearCookie(
                "refreshToken",
                {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "lax" : "strict"
                }
            )
            .status(200)
            .json({
                message: "Sesión cerrada correctamente"
            });

    } catch (error) {

        next(error);

    }

}

module.exports = {
    register,
    login,
    getCurrentUser,
    refresh,
    logout
};
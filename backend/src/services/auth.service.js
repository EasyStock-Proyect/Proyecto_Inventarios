const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} = require("../utils/jwt")

const hashToken = (token) => {

    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

};

async function register(data) {

    if (!data.password || data.password.length < 8) {
        throw new Error("La contraseña debe tener mínimo 8 caracteres");
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            email: data.email
        }
    });


    if (existingUser) {
        throw new Error("El email ya está registrado");
    }


    const passwordHash = await bcrypt.hash(
        data.password,
        10
    );


    const user = await prisma.user.create({
        data: {
            email: data.email,
            passwordHash: passwordHash,
            businessName: data.businessName,
            businessType: data.businessType
        }
    });


    return user;
}

async function login(data) {

    const user = await prisma.user.findUnique({
        where:{
            email:data.email
        }
    });


    if(!user){
        throw new Error("Credenciales inválidas");
    }


    const passwordValid = await bcrypt.compare(
        data.password,
        user.passwordHash
    );


    if(!passwordValid){
        throw new Error("Credenciales inválidas");
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const decodedRefreshToken = jwt.decode(refreshToken);

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: hashToken(refreshToken),
            expiresAt: new Date(
                decodedRefreshToken.exp * 1000)
        }
    });

    return {
        accessToken,
        refreshToken
    };

}

async function getCurrentUser(userId) {

    const user = await prisma.user.findUnique({

        where: {
            id: userId
        },

        select: {

            id: true,
            email: true,
            businessName: true,
            businessType: true

        }

    });


    if (!user) {

        throw new Error("Usuario no encontrado.");

    }


    return user;

}

async function refreshSession(refreshToken) {

    if (!refreshToken) {
        throw new Error("Refresh token no proporcionado");
    }

    let decoded;

    try {

        decoded = verifyRefreshToken(refreshToken);

    } catch (error) {

        throw new Error("Refresh token inválido o expirado");

    }

    const tokenHash = hashToken(refreshToken);

    const storedToken = await prisma.refreshToken.findFirst({
        where: {
            userId: decoded.id,
            tokenHash,
            revokedAt: null
        }
    });

    if (!storedToken) {
        throw new Error("Refresh token inválido o revocado");
    }

    if (storedToken.expiresAt < new Date()) {

        throw new Error("Refresh token expirado");

    }

    const user = await prisma.user.findUnique({
        where: {
            id: decoded.id
        }
    });

    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const newDecodedRefreshToken =
        jwt.decode(newRefreshToken);

    await prisma.$transaction([

        prisma.refreshToken.update({
            where: {
                id: storedToken.id
            },
            data: {
                revokedAt: new Date()
            }
        }),

        prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: hashToken(newRefreshToken),
                expiresAt: new Date(
                    newDecodedRefreshToken.exp * 1000
                )
            }
        })

    ]);

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };

}

async function logout(refreshToken) {

    if (!refreshToken) {
        return;
    }

    const tokenHash = hashToken(refreshToken);

    await prisma.refreshToken.updateMany({
        where: {
            tokenHash,
            revokedAt: null
        },
        data: {
            revokedAt: new Date()
        }
    });

}


module.exports = {
    register,
    login,
    getCurrentUser,
    refreshSession,
    logout
};
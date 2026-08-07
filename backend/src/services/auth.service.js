const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

const {
    generateAccessToken,
    generateRefreshToken,
} = require("../utils/jwt")


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


module.exports = {
    register,
    login,
    getCurrentUser
};
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");


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


    const accessToken = jwt.sign(
        {
            id:user.id,
            email:user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"1h"
        }
    );


    const refreshToken = jwt.sign(
        {
            id:user.id
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d"
        }
    );


    return {
        accessToken,
        refreshToken
    };
}

module.exports = {
    register,
    login
};
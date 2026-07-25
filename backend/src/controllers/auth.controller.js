const authService = require("../services/auth.service")

async function register(req, res, next) {
    try{
        const user = await authService.register(req.body);

        res.status(201).json(user);
    }catch(error){
        next(error)
    }
}

async function login(req, res, next) {
    try{
        const token = await authService.login(req.body);

        res.status(200).json(token);
    }catch(error){
        next(error)
    }
}

module.exports = {
    register,
    login
};
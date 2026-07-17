const express = require("express");
const authService = require("../services/auth.service");

const router = express.Router();


router.post("/register", async (req, res) => {

    try {

        const user = await authService.register(req.body);

        res.status(201).json({
            message: "Usuario registrado correctamente",
            user: {
                id: user.id,
                email: user.email,
                businessName: user.businessName,
                businessType: user.businessType
            }
        });


    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

});

router.post("/login", async (req, res) => {

    try {

        const tokens = await authService.login(req.body);


        res.status(200).json(tokens);


    } catch(error) {

        res.status(401).json({
            message: error.message
        });

    }

});

module.exports = router;
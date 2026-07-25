const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, (req, res) => {
    res.json({
        message: "Ruta protegida funcionando.",
        user: req.user
    });
});

module.exports = router;
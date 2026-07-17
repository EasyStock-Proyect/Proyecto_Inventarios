const express = require("express");

const router = express.Router();

router.post("/register", (req, res) => {

    res.json({
        message: "Ruta de registro funcionando"
    });

});

module.exports = router;
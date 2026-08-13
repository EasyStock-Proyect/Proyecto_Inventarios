const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const saleController = require("../controllers/sale.controller");


router.get(
    "/",
    authMiddleware,
    saleController.getSales
);


router.post(
    "/",
    authMiddleware,
    saleController.createSale
);


module.exports = router;
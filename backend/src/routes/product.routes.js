const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");


router.post(
    "/", 
    authMiddleware,
    productController.createProduct
);

router.get(
    "/",
    authMiddleware,
    productController.getProducts
);

router.put(
    "/:id",
    authMiddleware,
    productController.updateProduct
);

router.delete(
    "/:id",
    authMiddleware,
    productController.deleteProduct
);

router.post(
    "/:id/adjustments",
    authMiddleware,
    productController.adjustStock
);

router.get(
    "/:id/adjustments",
    authMiddleware,
    productController.getStockAdjustments
);

module.exports = router;
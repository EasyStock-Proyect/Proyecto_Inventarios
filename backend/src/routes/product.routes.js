const express = require("express");
const router = express.Router();

const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");


router.post(
    "/", 
    authMiddleware.verifyToken,
    productController.createProduct
);

router.get(
    "/",
    authMiddleware.verifyToken,
    productController.getAllProducts
);

router.put(
    "/:id",
    authMiddleware.verifyToken,
    productController.updateProduct
);

router.delete(
    "/:id",
    authMiddleware.verifyToken,
    productController.deleteProduct
);

module.exports = router;
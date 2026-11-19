const express = require("express");
const multer = require("multer");
const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }
});

const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get(
    "/import-excel/template",
    authMiddleware,
    productController.downloadExcelTemplate
);

router.post(
    "/import-excel",
    authMiddleware,
    upload.any(),
    productController.importProductsFromExcel
);

router.get(
    "/generate-sku",
    authMiddleware,
    productController.generateSku
);

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
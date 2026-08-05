const express = require("express");

const router = express.Router();

const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");
const alertRoutes = require("./alert.routes");
const saleRoutes = require("./sale.routes");

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/alerts", alertRoutes);
router.use("/sales", saleRoutes);

module.exports = router;
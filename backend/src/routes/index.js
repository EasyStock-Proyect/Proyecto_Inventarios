const express = require("express");

const router = express.Router();

const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");
const saleRoutes = require("./sale.routes");
const alertRoutes = require("./alert.routes");

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/sales", saleRoutes);
router.use("/alerts", alertRoutes);

module.exports = router;
const express = require("express");

const router = express.Router();

const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const categoryRoutes = require("./category.routes");
const saleRoutes = require("./sale.routes");
const alertRoutes = require("./alert.routes");
const reportRoutes = require("./report.routes");

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/sales", saleRoutes);
router.use("/alerts", alertRoutes);
router.use("/reports", reportRoutes);

module.exports = router;
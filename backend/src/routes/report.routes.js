const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const reportController = require("../controllers/report.controller");

const router = express.Router();

router.get(
	"/sales",
	authMiddleware,
	reportController.getSalesReport
);

module.exports = router;

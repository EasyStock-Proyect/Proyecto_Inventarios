const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const alertController = require("../controllers/alert.controller");

router.get(
    "/",
    authMiddleware,
    alertController.getAlerts
);

router.patch(
    "/:id/read",
    authMiddleware,
    alertController.markAlertAsRead
);

module.exports = router;
const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const predictionController = require("../controllers/prediction.controller");

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    predictionController.getPredictions
);

router.get(
    "/:productId/detail",
    authMiddleware,
    predictionController.getPredictionDetail
);

module.exports = router;
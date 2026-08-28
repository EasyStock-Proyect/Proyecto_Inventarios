const predictionService = require("../services/prediction.service");

const getPredictions = async (req, res, next) => {

    try {

        const predictions =
            await predictionService.getPredictions(req.user.id);

        res.status(200).json(predictions);

    } catch (error) {

        next(error);

    }

};

const getPredictionDetail = async (req, res, next) => {

    try {

        const detail =
            await predictionService.getPredictionDetail(
                req.user.id,
                req.params.productId
            );

        res.status(200).json(detail);

    } catch (error) {

        next(error);

    }

};

module.exports = {
    getPredictions,
    getPredictionDetail
};
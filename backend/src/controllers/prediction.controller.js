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

module.exports = {
    getPredictions
};
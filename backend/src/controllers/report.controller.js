const reportService = require("../services/report.service");

const getSalesReport = async (req, res, next) => {

    try {

        const {
            from,
            to,
            groupBy = "day"
        } = req.query;

        const report =
            await reportService.getSalesReport({
                userId: req.user.id,
                from,
                to,
                groupBy
            });

        res.status(200).json(report);

    } catch (error) {

        next(error);

    }

};

module.exports = {
    getSalesReport
};
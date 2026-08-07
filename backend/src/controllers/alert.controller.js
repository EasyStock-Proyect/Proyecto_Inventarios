const alertService = require("../services/alert.service");

async function getAlerts(req, res) {

    try {

        const alerts = await alertService.getAlerts(
            req.user.id
        );

        res.status(200).json(alerts);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
}

async function markAlertAsRead(req, res) {

    try {

        const alert = await alertService.markAsRead(
            req.user.id,
            req.params.id
        );

        res.status(200).json({
            message: "Alerta marcada como leída.",
            alert
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
}

module.exports = {
    getAlerts,
    markAlertAsRead
};
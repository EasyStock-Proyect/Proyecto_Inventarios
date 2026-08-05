const saleService = require("../services/sale.service");

async function createSale(req, res) {

    try {

        const sale = await saleService.createSale(
            req.user.id,
            req.body
        );

        res.status(201).json({
            message: "Venta registrada exitosamente",
            sale
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

}

module.exports = {
    createSale
};
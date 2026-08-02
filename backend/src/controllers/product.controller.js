const productService = require("../services/product.service");

async function createProduct(req, res) {
    
    try {

        const product = await productService.createProduct(
            req.user.id,
            req.body
        );
    
        res.status(201).json({
            message: "Producto creado exitosamente",
            product,
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

}

async function getProducts(req, res) {

    try {

        const products = await productService.getProducts(
            req.user.id,
            req.query
        );

        res.json(products);
        
    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

}

async function updateProduct(req, res) {

    try {

        const product = await productService.updateProduct(
            req.user.id,
            req.params.id,
            req.body
        );

        res.json({
            message: "Producto actualizado exitosamente",
            product
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

}

async function deleteProduct(req, res) {

    try {

        const result = await productService.deleteProduct(
            req.user.id,
            req.params.id
        );

        res.json({
            message: "Producto eliminado exitosamente",
            product: result
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

}

async function adjustStock(req, res) {

    try {

        const adjustment = await productService.adjustStock(
            req.user.id,
            req.params.id,
            req.body
        );

        res.status(201).json({
            message: "Ajuste de stock realizado exitosamente",
            adjustment
        });

    } catch (error) {

        const status = error.status || 400;

        res.status(status).json({
            message: error.message
        });

    }

}

async function getStockAdjustments(req, res) {

    try {

        const adjustments = await productService.getStockAdjustments(
            req.user.id,
            req.params.id,
            req.query
        );

        res.json(adjustments);

    } catch (error) {

        const status = error.status || 400;

        res.status(status).json({
            message: error.message
        });
    
    }

}



module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    adjustStock,
    getStockAdjustments
};
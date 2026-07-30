const categoryService = require("../services/category.service");

async function getCategories(req, res) {

    try {
        const categories = await categoryService.getCategories(req.user.id);
        res.json(categories);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }

}

async function createCategory(req, res) {

    try {

        const category = await categoryService.createCategory(
            req.user.id,
            req.body
        );

        res.status(201).json(category);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

}

async function updateCategory(req, res) {

    try {

        const category = await categoryService.updateCategory(
            req.user.id,
            req.params.id,
            req.body
        );

        res.json(category);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

}

async function deleteCategory(req, res) {

    try {

        const result = await categoryService.deleteCategory(
            req.user.id,
            req.params.id
        );

        res.json(result);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

}

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
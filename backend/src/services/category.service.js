const prisma = require("../config/prisma");

async function getCategories(userId) {

    const categories = await prisma.category.findMany({

        where: {
            userId: userId
        },

        orderBy: {
            name: "asc"
        }

    });

    return categories;

}
async function createCategory(userId, data) {
    
    if (!data.name || !data.name.trim()) {
        throw new Error("El nombre de la categoría es obligatorio");
    }

    const totalCategories = await prisma.category.count({

        where: {
            userId: userId
        }
    
    });

    if (totalCategories >= 50) {
        throw new Error(
            "No puedes crear más de 50 categorías."
        );
    }

    const existingCategory = await prisma.category.findFirst({

        where: {
            userId: userId,
            name: data.name.trim()
        }

    });

    if (existingCategory) {
        throw new Error(
            "Ya existe una categoría con ese nombre."
        );
    }

    const category = await prisma.category.create({

        data: {
            name: data.name.trim(),
            userId: userId
        }
    
    });

    return category;

}

module.exports = {
    getCategories,
    createCategory
};
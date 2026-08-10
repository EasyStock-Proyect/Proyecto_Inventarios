const prisma = require("../config/prisma");

async function getCategories(userId) {

    const categories = await prisma.category.findMany({

        where: {
            userId: userId
        },

        orderBy: {
            name: "asc"
        },

        include: {
            _count: {
                select: {
                    products: {
                        where: {
                            deletedAt: null
                        }
                    }
                }
            }
        }

    });

    return categories.map((category) => ({

        ...category,

        productCount: category._count.products,

        _count: undefined

    }));

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

async function updateCategory(userId, categoryId, data) {

    const category = await prisma.category.findUnique({

        where: {
            id: categoryId,
            userId
        }

    });

    if (!category) {
        throw new Error("Categoría no encontrada");
    }

    if (!data.name || !data.name.trim()) {
        throw new Error("El nombre de la categoría es obligatorio");
    }

    const existingCategory = await prisma.category.findFirst({

        where: {
            userId,
            name: data.name.trim(),

            NOT: {
                id: categoryId
            }
        }

    });

    if (existingCategory) {
        throw new Error(
            "Ya existe una categoría con ese nombre."
        );
    }

    const updatedCategory = await prisma.category.update({

        where: {
            id: categoryId
        },

        data: {
            name: data.name.trim()
        }

    });

    return updatedCategory;

}

async function deleteCategory(userId, categoryId) {

    const category = await prisma.category.findFirst({

        where: {
            id: categoryId,
            userId
        }

    });

    if (!category) {
        throw new Error("Categoría no encontrada");
    }

    const product = await prisma.product.findFirst({

        where: {
            categoryId: categoryId,
            userId
        }

    });

    if (product) {
        throw new Error(
            "No se puede eliminar la categoría porque tiene productos asociados."
        );
    }


    const deletedCategory = await prisma.category.delete({

        where: {
            id: categoryId
        }

    });

    return deletedCategory;

};

module.exports = {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
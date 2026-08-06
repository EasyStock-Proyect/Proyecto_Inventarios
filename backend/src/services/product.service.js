const prisma = require ("../config/prisma");

async function generateSku(userId, categoryId) {

    const category = await prisma.category.findFirst({

        where: {
            id: categoryId,
            userId
        }

    });

    if (!category) {
        throw new Error("Categoría no encontrada.");
    }

    const prefix = category.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z]/g, "")
        .substring(0, 3)
        .toUpperCase();

    const lastProduct = await prisma.product.findFirst({

        where: {
            userId,
            categoryId
        },

        orderBy: {
            sku: "desc"
        }

    });

    let nextNumber = 1;

    if (lastProduct) {

        const parts = lastProduct.sku.split("-");

        nextNumber = Number(parts[1]) + 1;

    }

    return `${prefix}-${String(nextNumber).padStart(4, "0")}`;

}

async function createProduct(userId, data) {

    const {
        name,
        sku,
        categoryId,
        price,
        stockCurrent,
        stockMinimum
    } = data;

    if (
        !name ||
        !categoryId ||
        price === undefined ||
        stockCurrent === undefined ||
        stockMinimum === undefined
    ) {
        throw new Error("Todos los campos son obligatorios.");
    }

    if (!name.trim()) {
        throw new Error("El nombre del producto es obligatorio.");
    }

    if (stockCurrent < 0) {
        throw new Error("El stock inicial no puede ser negativo.");
    }

    if (stockMinimum < 0) {
        throw new Error("El stock mínimo no puede ser negativo.");
    }

    if (price <= 0) {
        throw new Error("El precio debe ser mayor que cero.");
    }

    let finalSku;

    if (sku && sku.trim()) {

        finalSku = sku.trim();

        const existingProduct = await prisma.product.findFirst({

            where: {
                userId,
                sku: finalSku
            }

        });

        if (existingProduct) {
            throw new Error("Ya existe un producto con ese SKU.");
        }

    } else {

        finalSku = await generateSku(
            userId,
            categoryId
        );

    }

    const category = await prisma.category.findFirst({

        where: {
            id: categoryId,
            userId
        }

    });

    if (!category) {
        throw new Error("Categoría no encontrada.");
    }

    const product = await prisma.product.create({

        data: {
            userId,
            categoryId,
            name: name.trim(),
            sku: finalSku,
            price,
            stockCurrent,
            stockMinimum
        }
    });

    return product;

}

async function getProducts(userId, query) {

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    
    const search = query.search || "";
    const categoryId = query.categoryId || null;

    const where = {
        userId,
        deletedAt: null,
    };

    if (search) {

        where.OR = [
            {
                name:{
                    contains: search,
                }
            },{
                sku: {
                    contains: search
                }
            }
        ]

    }

    if (categoryId) {

        where.categoryId = categoryId;  

    }

    const products = await prisma.product.findMany({

        where,

        skip: (page - 1) * limit,

        take: limit,

        orderBy: {
            name: "asc"
        },

        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }

    
    });

    const total = await prisma.product.count({
        where
    });

    return {
        data: products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };

}

async function updateProduct(userId, productId, data) {

    const product = await prisma.product.findFirst({

        where: {
            id: productId,
            userId,
            deletedAt: null
        }

    });

    if (!product) {
        throw new Error("Producto no encontrado.");
    }

    const updateData = {};

    if (data.name !== undefined) {

        if (!data.name.trim()) {
            throw new Error("El nombre del producto es obligatorio.");
        }

        updateData.name = data.name.trim();

    }

    if (data.sku !== undefined) {

        if (!data.sku.trim()) {
            throw new Error("El SKU del producto es obligatorio.");
        }

        const existingProduct = await prisma.product.findFirst({

            where: {
                userId,
                sku: data.sku.trim(),

                NOT: {
                    id: productId
                }
            }

        });

        if (existingProduct) {
            throw new Error("Ya existe un producto con ese SKU.");
        }

        updateData.sku = data.sku.trim();

    }

    

    if (data.categoryId !== undefined) {

        const category = await prisma.category.findFirst({

            where: {
                id: data.categoryId,
                userId
            }
        
        });
    
        if (!category) {
            throw new Error("Categoría no encontrada.");
        }

        updateData.categoryId = data.categoryId;

    }

    if (data.price !== undefined) {
        updateData.price = data.price;
    }

    if (data.stockMinimum !== undefined) {
        updateData.stockMinimum = data.stockMinimum;
    }

    const updatedProduct = await prisma.product.update({
        where: {
            id: productId
        },
        data: updateData,
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    return updatedProduct;

}

async function deleteProduct(userId, productId) {

    const product = await prisma.product.findFirst({

        where: {
            id: productId,
            userId,
            deletedAt: null
        }

    });

    if (!product) {
        throw new Error("Producto no encontrado.");
    }

    const deletedProduct = await prisma.product.update({

        where: {
            id: productId
        },

        data: {
            deletedAt: new Date()
        }

    });

    return deletedProduct;

}

async function adjustStock(userId, productId, data) {

    const  { quantity, reason, direction, notes } = data;

    const product = await prisma.product.findFirst({

        where: {
            id: productId,
            userId,
            deletedAt: null
        }
    
    });

    if (!product) {
        throw new Error("Producto no encontrado.");
    }

    if (quantity === undefined) {
        throw new Error("La cantidad es obligatoria.");
    }

    if (typeof quantity !== "number") {
        throw new Error("La cantidad debe ser un número.");
    }

    if (!Number.isInteger(quantity)) {
        throw new Error("La cantidad debe ser un número entero.");
    }

    if (quantity <= 0) {
        throw new Error("La cantidad debe ser mayor que cero.");
    }

    if (!reason) {
        throw new Error("La razón del ajuste es obligatoria.");
    }
    
    const validReasons = [
        "ENTRY",
        "DEVOLUTION",
        "LOSS",
        "CORRECTION"
    ];

    if (!validReasons.includes(reason)) {
        throw new Error("Razón de ajuste inválida.");
    }
    
    if (reason === "CORRECTION") {

        if (!direction) {
            throw new Error("La dirección de la corrección es obligatoria.");
        }

        const validDirections = [
            "INCREASE",
            "DECREASE"
        ];

        if (!validDirections.includes(direction)) {
            throw new Error(
                "La dirección de la corrección es inválida."
            );
        }

    }

    let stockAdjustment;

    switch (reason) {

        case "ENTRY":
        case "DEVOLUTION":

            stockAdjustment = quantity;
            break;

        case "LOSS":

            stockAdjustment = -quantity;
            break;

        case "CORRECTION":

            stockAdjustment =
                direction === "INCREASE"
                    ? quantity
                    : -quantity;

            break;

    }

    const newStock = product.stockCurrent + stockAdjustment;

    if (newStock < 0) {
        
        const error = new Error(
            "El ajuste de stock no puede resultar en un stock negativo."
        );

        error.status = 422;

        throw error;

    }

    const stockMovement = await prisma.$transaction(async (tx) => {

        await tx.product.update({

            where: {
                id: productId
            },

            data: {
                stockCurrent: newStock
            }

        });

        const movement = await tx.stockMovement.create({

            data: {
                productId,
                userId,
                quantity: stockAdjustment,
                reason,
                notes
            }
        });

        return movement;

    });

    return stockMovement;

}

async function getStockAdjustments(userId, productId, query) {

    const product = await prisma.product.findFirst({

        where: {
            id: productId,
            userId,
            deletedAt: null
        }
    
    });

    if (!product) {
        throw new Error("Producto no encontrado.");
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const skip = (page - 1) * limit;

    const adjustments = await prisma.stockMovement.findMany({

        where: {
            productId,
            userId
        },

        skip,
        take: limit,

        orderBy: {
            createdAt: "desc"
        }

    });

    const total = await prisma.stockMovement.count({

        where: {
            productId
        }

    });

    return {

        data: adjustments,

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }

    };

}

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
    adjustStock,
    getStockAdjustments,
    generateSku
};
const prisma = require("../config/prisma");

async function createSale(userId, data) {

    const { items } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error(
            "La venta debe contener al menos un producto."
        );
    }

    return await prisma.$transaction(
        async (tx) => {

            let total = 0;

            const saleItems = [];

            for (const item of items) {

                const { productId, quantity, unitPrice } = item;

                if (
                    !productId ||
                    quantity === undefined ||
                    quantity === null
                ) {
                    throw new Error(
                        "Cada producto debe tener productId y quantity."
                    );
                }

                if (
                    !Number.isInteger(quantity) ||
                    quantity <= 0
                ) {
                    throw new Error(
                        "La cantidad debe ser un número entero mayor que cero."
                    );
                }

                if (
                    unitPrice === undefined ||
                    unitPrice === null
                ) {
                    throw new Error(
                        "Cada producto debe tener productId, quantity y unitPrice."
                    );
                }

                const product = await tx.product.findFirst({
                    where: {
                        id: productId,
                        userId,
                        deletedAt: null
                    }
                });

                if (!product) {
                    throw new Error(
                        `Producto no encontrado: ${productId}`
                    );
                }

                if (Number(unitPrice) !== Number(product.price)) {
                    throw new Error(
                        `El precio del producto ${product.name} no coincide con el precio actual.`
                    );
                }

                if (product.stockCurrent < quantity) {
                    throw new Error(
                        `Stock insuficiente para el producto ${product.name}.`
                    );
                }

                const subtotal =
                    Number(product.price) * quantity;

                total += subtotal;

                saleItems.push({
                    product,
                    quantity,
                    unitPrice,
                    subtotal,
                });
            }

            const sale = await tx.sale.create({
                data: {
                    userId,
                    total
                }
            });

            for (const item of saleItems) {

                const {
                    product,
                    quantity,
                    unitPrice,
                    subtotal
                } = item;

                await tx.saleItem.create({
                    data: {
                        saleId: sale.id,
                        productId: product.id,
                        quantity,
                        unitPrice,
                        subtotal
                    }
                });

                const updatedProduct = await tx.product.updateMany({
                    where: {
                        id: product.id,
                        userId,
                        deletedAt: null,
                        stockCurrent: {
                            gte: quantity
                        }
                    },
                    data: {
                        stockCurrent: {
                            decrement: quantity
                        }
                    }
                });

                if (updatedProduct.count !== 1) {
                    throw new Error(
                        `Stock insuficiente para el producto ${product.name}.`
                    );
                }

                const newStock =
                    product.stockCurrent - quantity;

                if (newStock <= product.stockMinimum) {

                    const existingAlert =
                        await tx.stockAlert.findFirst({
                            where: {
                                productId: product.id,
                                userId,
                                isRead: false
                            }
                        });

                    if (!existingAlert) {

                        await tx.stockAlert.create({
                            data: {
                                productId: product.id,
                                userId,
                                stockAlert: newStock
                            }
                        });

                    }
                }
            }

            return sale;
        },
        {
            isolationLevel: "Serializable"
        }
    );
}


async function getSales(userId, query = {}) {

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const { startDate, endDate } = query;

    const where = {
        userId
    };

    if (startDate || endDate) {

        where.createdAt = {};

        if (startDate) {
            where.createdAt.gte =
                new Date(`${startDate}T00:00:00`);
        }

        if (endDate) {
            where.createdAt.lte =
                new Date(`${endDate}T23:59:59.999`);
        }
    }

    const sales = await prisma.sale.findMany({

        where,

        skip: (page - 1) * limit,

        take: limit,

        orderBy: {
            createdAt: "desc"
        },

        include: {
            items: {
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            sku: true
                        }
                    }
                }
            }
        }
    });

    const total = await prisma.sale.count({
        where
    });

    return {
        data: sales,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}


module.exports = {
    createSale,
    getSales
};
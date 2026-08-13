const prisma = require("../config/prisma");

async function createSale(userId, data) {

    const { items } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error(
            "La venta debe contener al menos un producto."
        );
    }

    return await prisma.$transaction(async (tx) => {

        let total = 0;

        const saleItems = [];

        for (const item of items) {

            const { productId, quantity } = item;

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
                subtotal
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
                subtotal
            } = item;

            await tx.saleItem.create({
                data: {
                    saleId: sale.id,
                    productId: product.id,
                    quantity,
                    unitPrice: product.price,
                    subtotal
                }
            });

            const newStock =
                product.stockCurrent - quantity;

            await tx.product.update({
                where: {
                    id: product.id
                },
                data: {
                    stockCurrent: newStock
                }
            });

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
    });
}


async function getSales(userId, query = {}) {

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const sales = await prisma.sale.findMany({

        where: {
            userId
        },

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
        where: {
            userId
        }
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
const prisma = require("../config/prisma");

async function getAlerts(userId) {

    const alerts = await prisma.stockAlert.findMany({

        where: {
            userId,
            isRead: false
        },

        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    stockCurrent: true,
                    stockMinimum: true,

                    category: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },

        orderBy: {
            createdAt: "desc"
        }

    });

    return alerts;
}


async function markAsRead(userId, alertId) {

    const alert = await prisma.stockAlert.findFirst({

        where: {
            id: alertId,
            userId
        }

    });

    if (!alert) {
        throw new Error("Alerta no encontrada.");
    }

    const updatedAlert = await prisma.stockAlert.update({

        where: {
            id: alertId
        },

        data: {
            isRead: true
        }

    });

    return updatedAlert;
}


module.exports = {
    getAlerts,
    markAsRead
};
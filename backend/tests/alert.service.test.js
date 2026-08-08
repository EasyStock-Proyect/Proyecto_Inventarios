jest.mock("../src/config/prisma", () => ({
    stockAlert: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn()
    }
}));

const prisma = require("../src/config/prisma");
const alertService = require("../src/services/alert.service");

beforeEach(() => {
    jest.clearAllMocks();
});

describe("getAlerts", () => {

    test("debe retornar las alertas activas no leídas del usuario", async () => {

        const alerts = [
            {
                id: "alert-1",
                userId: "user-1",
                productId: "product-1",
                stockAlert: 5,
                isRead: false,
                product: {
                    id: "product-1",
                    name: "Producto Test",
                    sku: "PRO-0001",
                    stockCurrent: 5,
                    stockMinimum: 5,
                    category: {
                        name: "Tecnología"
                    }
                }
            }
        ];

        prisma.stockAlert.findMany.mockResolvedValue(alerts);

        const result = await alertService.getAlerts("user-1");

        expect(prisma.stockAlert.findMany).toHaveBeenCalledWith({
            where: {
                userId: "user-1",
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

        expect(result).toEqual(alerts);
    });

});


describe("markAsRead", () => {

    test("debe marcar una alerta como leída", async () => {

        const alert = {
            id: "alert-1",
            userId: "user-1",
            productId: "product-1",
            stockAlert: 5,
            isRead: false
        };

        const updatedAlert = {
            ...alert,
            isRead: true
        };

        prisma.stockAlert.findFirst.mockResolvedValue(alert);

        prisma.stockAlert.update.mockResolvedValue(updatedAlert);

        const result = await alertService.markAsRead(
            "user-1",
            "alert-1"
        );

        expect(prisma.stockAlert.findFirst).toHaveBeenCalledWith({
            where: {
                id: "alert-1",
                userId: "user-1"
            }
        });

        expect(prisma.stockAlert.update).toHaveBeenCalledWith({
            where: {
                id: "alert-1"
            },
            data: {
                isRead: true
            }
        });

        expect(result).toEqual(updatedAlert);
    });


    test("debe lanzar un error si la alerta no existe", async () => {

        prisma.stockAlert.findFirst.mockResolvedValue(null);

        await expect(
            alertService.markAsRead(
                "user-1",
                "alert-inexistente"
            )
        ).rejects.toThrow(
            "Alerta no encontrada."
        );

        expect(prisma.stockAlert.update).not.toHaveBeenCalled();
    });

});
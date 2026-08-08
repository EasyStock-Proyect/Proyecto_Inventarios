jest.mock("../src/config/prisma", () => ({
    $transaction: jest.fn()
}));

const prisma = require("../src/config/prisma");
const saleService = require("../src/services/sale.service");

function createTransactionMock(product = {}) {
    return {
        product: {
            findFirst: jest.fn().mockResolvedValue({
                id: "prod1",
                userId: "user1",
                name: "Mouse",
                price: 100,
                stockCurrent: 10,
                stockMinimum: 5,
                deletedAt: null,
                ...product
            }),
            update: jest.fn()
        },

        sale: {
            create: jest.fn().mockResolvedValue({
                id: "sale1",
                total: 100
            })
        },

        saleItem: {
            create: jest.fn()
        },

        stockAlert: {
            findFirst: jest.fn().mockResolvedValue(null),
            create: jest.fn()
        }
    };
}

beforeEach(() => {
    jest.resetAllMocks();

    prisma.$transaction.mockImplementation(
        async callback => callback(createTransactionMock())
    );
});

describe("createSale", () => {

    test("debe rechazar venta sin items", async () => {

        await expect(
            saleService.createSale("user1", {})
        ).rejects.toThrow(
            "La venta debe contener al menos un producto."
        );

    });

    test("debe rechazar items vacío", async () => {

        await expect(
            saleService.createSale(
                "user1",
                { items: [] }
            )
        ).rejects.toThrow(
            "La venta debe contener al menos un producto."
        );

    });

    test("debe rechazar productId faltante", async () => {

        await expect(
            saleService.createSale(
                "user1",
                {
                    items: [
                        {
                            quantity: 2
                        }
                    ]
                }
            )
        ).rejects.toThrow(
            "Cada producto debe tener productId y quantity."
        );

    });

    test("debe rechazar quantity faltante", async () => {

        await expect(
            saleService.createSale(
                "user1",
                {
                    items: [
                        {
                            productId: "prod1"
                        }
                    ]
                }
            )
        ).rejects.toThrow(
            "Cada producto debe tener productId y quantity."
        );

    });

    test("debe rechazar cantidad cero", async () => {

        await expect(
            saleService.createSale(
                "user1",
                {
                    items: [
                        {
                            productId: "prod1",
                            quantity: 0
                        }
                    ]
                }
            )
        ).rejects.toThrow(
            "La cantidad debe ser un número entero mayor que cero."
        );

    });

    test("debe rechazar cantidad negativa", async () => {

        await expect(
            saleService.createSale(
                "user1",
                {
                    items: [
                        {
                            productId: "prod1",
                            quantity: -1
                        }
                    ]
                }
            )
        ).rejects.toThrow(
            "La cantidad debe ser un número entero mayor que cero."
        );

    });

    test("debe rechazar cantidad decimal", async () => {

        await expect(
            saleService.createSale(
                "user1",
                {
                    items: [
                        {
                            productId: "prod1",
                            quantity: 1.5
                        }
                    ]
                }
            )
        ).rejects.toThrow(
            "La cantidad debe ser un número entero mayor que cero."
        );

    });

    test("debe rechazar producto inexistente", async () => {

        const tx = createTransactionMock();

        tx.product.findFirst.mockResolvedValue(null);

        prisma.$transaction.mockImplementation(
            async callback => callback(tx)
        );

        await expect(
            saleService.createSale(
                "user1",
                {
                    items: [
                        {
                            productId: "prod1",
                            quantity: 2
                        }
                    ]
                }
            )
        ).rejects.toThrow(
            "Producto no encontrado: prod1"
        );

    });

    test("debe rechazar stock insuficiente", async () => {

        const tx = createTransactionMock({
            stockCurrent: 1
        });

        prisma.$transaction.mockImplementation(
            async callback => callback(tx)
        );

        await expect(
            saleService.createSale(
                "user1",
                {
                    items: [
                        {
                            productId: "prod1",
                            quantity: 2
                        }
                    ]
                }
            )
        ).rejects.toThrow(
            "Stock insuficiente para el producto Mouse."
        );

    });

    test("debe crear venta y reducir stock", async () => {

        const tx = createTransactionMock();

        prisma.$transaction.mockImplementation(
            async callback => callback(tx)
        );

        tx.sale.create.mockResolvedValue({
            id: "sale1",
            total: 200
        });

        const result =
            await saleService.createSale(
                "user1",
                {
                    items: [
                        {
                            productId: "prod1",
                            quantity: 2
                        }
                    ]
                }
            );

        expect(result.id).toBe("sale1");

        expect(tx.saleItem.create)
            .toHaveBeenCalled();

        expect(tx.product.update)
            .toHaveBeenCalledWith({
                where: {
                    id: "prod1"
                },
                data: {
                    stockCurrent: 8
                }
            });

    });

    test("debe crear alerta cuando el stock llega al mínimo", async () => {

        const tx = createTransactionMock({
            stockCurrent: 10,
            stockMinimum: 5
        });

        prisma.$transaction.mockImplementation(
            async callback => callback(tx)
        );

        await saleService.createSale(
            "user1",
            {
                items: [
                    {
                        productId: "prod1",
                        quantity: 5
                    }
                ]
            }
        );

        expect(tx.stockAlert.create)
            .toHaveBeenCalled();

    });

    test("no debe duplicar una alerta existente", async () => {

        const tx = createTransactionMock();

        tx.stockAlert.findFirst.mockResolvedValue({
            id: "existing-alert",
            isRead: false
        });

        prisma.$transaction.mockImplementation(
            async callback => callback(tx)
        );

        await saleService.createSale(
            "user1",
            {
                items: [
                    {
                        productId: "prod1",
                        quantity: 5
                    }
                ]
            }
        );

        expect(tx.stockAlert.create)
            .not.toHaveBeenCalled();

    });

    test("debe procesar múltiples productos", async () => {

        const tx = createTransactionMock();

        tx.product.findFirst
            .mockResolvedValueOnce({
                id: "prod1",
                userId: "user1",
                name: "Mouse",
                price: 100,
                stockCurrent: 10,
                stockMinimum: 2,
                deletedAt: null
            })
            .mockResolvedValueOnce({
                id: "prod2",
                userId: "user1",
                name: "Teclado",
                price: 200,
                stockCurrent: 20,
                stockMinimum: 2,
                deletedAt: null
            });

        prisma.$transaction.mockImplementation(
            async callback => callback(tx)
        );

        const result =
            await saleService.createSale(
                "user1",
                {
                    items: [
                        {
                            productId: "prod1",
                            quantity: 2
                        },
                        {
                            productId: "prod2",
                            quantity: 3
                        }
                    ]
                }
            );

        expect(result).toBeDefined();

        expect(tx.saleItem.create)
            .toHaveBeenCalledTimes(2);

    });

});
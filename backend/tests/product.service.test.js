jest.mock("../src/config/prisma", () => ({
    category: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
    },
    product: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    stockMovement: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
    },
    $transaction: jest.fn()
}));

const prisma = require("../src/config/prisma");
const productService = require("../src/services/product.service");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("generateSku", () => {

    test("debe generar SKU correctamente", async () => {

        prisma.category.findFirst.mockResolvedValue({
            id: "cat1",
            name: "Tecnología"
        });

        prisma.product.findMany.mockResolvedValue([
            { sku: "TEC-0001" },
            { sku: "TEC-0003" },
            { sku: "OTRO" }
        ]);

        const result = await productService.generateSku(
            "user1",
            "cat1"
        );

        expect(result).toBe("TEC-0004");
    });

    test("debe rechazar si la categoría no existe", async () => {

        prisma.category.findFirst.mockResolvedValue(null);

        await expect(
            productService.generateSku("user1", "cat1")
        ).rejects.toThrow("Categoría no encontrada.");
    });

    test("debe ignorar SKU con formato incorrecto", async () => {

        prisma.category.findFirst.mockResolvedValue({
            id: "cat1",
            name: "Tecnología"
        });

        prisma.product.findMany.mockResolvedValue([
            { sku: "TEC" },
            { sku: "TEC-ABC" },
            { sku: "TEC-0002" }
        ]);

        const result = await productService.generateSku(
            "user1",
            "cat1"
        );

        expect(result).toBe("TEC-0003");
    });
});

describe("createProduct", () => {

    test("debe rechazar campos obligatorios faltantes", async () => {

        await expect(
            productService.createProduct("user1", {})
        ).rejects.toThrow("Todos los campos son obligatorios.");
    });

    test("debe rechazar nombre vacío", async () => {

        await expect(
            productService.createProduct("user1", {
                name: "   ",
                categoryId: "cat1",
                price: 100,
                stockCurrent: 5,
                stockMinimum: 2
            })
        ).rejects.toThrow(
            "El nombre del producto es obligatorio."
        );
    });

    test("debe rechazar stock inicial negativo", async () => {

        await expect(
            productService.createProduct("user1", {
                name: "Producto",
                categoryId: "cat1",
                price: 100,
                stockCurrent: -1,
                stockMinimum: 2
            })
        ).rejects.toThrow(
            "El stock inicial no puede ser negativo."
        );
    });

    test("debe rechazar stock mínimo negativo", async () => {

        await expect(
            productService.createProduct("user1", {
                name: "Producto",
                categoryId: "cat1",
                price: 100,
                stockCurrent: 5,
                stockMinimum: -1
            })
        ).rejects.toThrow(
            "El stock mínimo no puede ser negativo."
        );
    });

    test("debe rechazar precio cero o negativo", async () => {

        await expect(
            productService.createProduct("user1", {
                name: "Producto",
                categoryId: "cat1",
                price: 0,
                stockCurrent: 5,
                stockMinimum: 2
            })
        ).rejects.toThrow(
            "El precio debe ser mayor que cero."
        );
    });

    test("debe rechazar SKU duplicado", async () => {

        prisma.product.findFirst.mockResolvedValue({
            id: "existing"
        });

        await expect(
            productService.createProduct("user1", {
                name: "Producto",
                sku: "TEC-0001",
                categoryId: "cat1",
                price: 100,
                stockCurrent: 5,
                stockMinimum: 2
            })
        ).rejects.toThrow(
            "Ya existe un producto con ese SKU."
        );
    });

    test("debe generar SKU automáticamente", async () => {

        prisma.product.findFirst
            .mockResolvedValueOnce(null)
            .mockResolvedValueOnce({
                id: "cat1",
                name: "Tecnología"
            });

        prisma.category.findFirst.mockResolvedValue({
            id: "cat1",
            name: "Tecnología"
        });

        prisma.product.findMany.mockResolvedValue([]);

        prisma.product.create.mockResolvedValue({
            id: "prod1",
            name: "Mouse",
            sku: "TEC-0001"
        });

        const result = await productService.createProduct(
            "user1",
            {
                name: "Mouse",
                categoryId: "cat1",
                price: 100,
                stockCurrent: 5,
                stockMinimum: 2
            }
        );

        expect(result).toEqual({
            id: "prod1",
            name: "Mouse",
            sku: "TEC-0001"
        });
    });

    test("debe rechazar categoría inexistente", async () => {

        prisma.product.findFirst.mockResolvedValue(null);

        prisma.category.findFirst.mockResolvedValue(null);

        await expect(
            productService.createProduct("user1", {
                name: "Mouse",
                sku: "MOU-0001",
                categoryId: "cat1",
                price: 100,
                stockCurrent: 5,
                stockMinimum: 2
            })
        ).rejects.toThrow("Categoría no encontrada.");
    });

    test("debe crear producto con SKU proporcionado", async () => {

        prisma.product.findFirst.mockResolvedValue(null);

        prisma.category.findFirst.mockResolvedValue({
            id: "cat1",
            name: "Tecnología"
        });

        prisma.product.create.mockResolvedValue({
            id: "prod1",
            name: "Mouse",
            sku: "MOU-0001"
        });

        const result = await productService.createProduct(
            "user1",
            {
                name: " Mouse ",
                sku: " MOU-0001 ",
                categoryId: "cat1",
                price: 100,
                stockCurrent: 5,
                stockMinimum: 2
            }
        );

        expect(prisma.product.findFirst).toHaveBeenCalledWith({
            where: {
                userId: "user1",
                sku: "MOU-0001"
            }
        });

        expect(prisma.category.findFirst).toHaveBeenCalledWith({
            where: {
                id: "cat1",
                userId: "user1"
            }
        });

        expect(prisma.product.create).toHaveBeenCalledWith({
            data: {
                userId: "user1",
                categoryId: "cat1",
                name: "Mouse",
                sku: "MOU-0001",
                price: 100,
                stockCurrent: 5,
                stockMinimum: 2
            }
        });

        expect(result.name).toBe("Mouse");
        expect(result.sku).toBe("MOU-0001");

    });
});

describe("getProducts", () => {

    test("debe listar productos con paginación", async () => {

        prisma.product.findMany.mockResolvedValue([
            { id: "prod1" }
        ]);

        prisma.product.count.mockResolvedValue(1);

        const result = await productService.getProducts(
            "user1",
            {}
        );

        expect(result.data).toHaveLength(1);
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(20);
        expect(result.pagination.total).toBe(1);
    });

    test("debe aplicar búsqueda", async () => {

        prisma.product.findMany.mockResolvedValue([]);
        prisma.product.count.mockResolvedValue(0);

        await productService.getProducts(
            "user1",
            {
                search: "mouse"
            }
        );

        expect(prisma.product.findMany).toHaveBeenCalled();
    });

    test("debe filtrar por categoría y aceptar paginación", async () => {

        prisma.product.findMany.mockResolvedValue([]);
        prisma.product.count.mockResolvedValue(0);

        const result = await productService.getProducts(
            "user1",
            {
                page: "2",
                limit: "5",
                categoryId: "cat1"
            }
        );

        expect(result.pagination.page).toBe(2);
        expect(result.pagination.limit).toBe(5);
    });
});

describe("updateProduct", () => {

    const existingProduct = {
        id: "prod1",
        userId: "user1",
        deletedAt: null,
        name: "Mouse",
        sku: "MOU-0001"
    };

    test("debe rechazar producto inexistente", async () => {

        prisma.product.findFirst.mockResolvedValue(null);

        await expect(
            productService.updateProduct(
                "user1",
                "prod1",
                { name: "Nuevo" }
            )
        ).rejects.toThrow("Producto no encontrado.");
    });

    test("debe actualizar nombre", async () => {

        prisma.product.findFirst.mockResolvedValue(
            existingProduct
        );

        prisma.product.update.mockResolvedValue({
            id: "prod1",
            name: "Nuevo"
        });

        const result = await productService.updateProduct(
            "user1",
            "prod1",
            {
                name: " Nuevo "
            }
        );

        expect(result.name).toBe("Nuevo");
    });

    test("debe rechazar nombre vacío", async () => {

        prisma.product.findFirst.mockResolvedValue(
            existingProduct
        );

        await expect(
            productService.updateProduct(
                "user1",
                "prod1",
                {
                    name: " "
                }
            )
        ).rejects.toThrow(
            "El nombre del producto es obligatorio."
        );
    });

    test("debe actualizar SKU", async () => {

        prisma.product.findFirst
            .mockResolvedValueOnce(existingProduct)
            .mockResolvedValueOnce(null);

        prisma.product.update.mockResolvedValue({
            id: "prod1",
            sku: "NEW-0001"
        });

        const result = await productService.updateProduct(
            "user1",
            "prod1",
            {
                sku: " NEW-0001 "
            }
        );

        expect(result.sku).toBe("NEW-0001");
    });

    test("debe rechazar SKU vacío", async () => {

        prisma.product.findFirst.mockResolvedValue(
            existingProduct
        );

        await expect(
            productService.updateProduct(
                "user1",
                "prod1",
                {
                    sku: " "
                }
            )
        ).rejects.toThrow(
            "El SKU del producto es obligatorio."
        );
    });

    test("debe rechazar SKU duplicado", async () => {

        prisma.product.findFirst
            .mockResolvedValueOnce(existingProduct)
            .mockResolvedValueOnce({
                id: "other"
            });

        await expect(
            productService.updateProduct(
                "user1",
                "prod1",
                {
                    sku: "MOU-0002"
                }
            )
        ).rejects.toThrow(
            "Ya existe un producto con ese SKU."
        );
    });

    test("debe rechazar categoría inexistente", async () => {

        prisma.product.findFirst.mockResolvedValue(
            existingProduct
        );

        prisma.category.findFirst.mockResolvedValue(null);

        await expect(
            productService.updateProduct(
                "user1",
                "prod1",
                {
                    categoryId: "cat2"
                }
            )
        ).rejects.toThrow("Categoría no encontrada.");
    });

    test("debe actualizar categoría, precio y stock mínimo", async () => {

        prisma.product.findFirst.mockResolvedValue(
            existingProduct
        );

        prisma.category.findFirst.mockResolvedValue({
            id: "cat2",
            userId: "user1"
        });

        prisma.product.update.mockResolvedValue({
            id: "prod1",
            name: "Mouse",
            price: 200,
            stockMinimum: 10
        });

        const result = await productService.updateProduct(
            "user1",
            "prod1",
            {
                categoryId: "cat2",
                price: 200,
                stockMinimum: 10
            }
        );

        expect(result.price).toBe(200);
    });
});

describe("deleteProduct", () => {

    test("debe rechazar producto inexistente", async () => {

        prisma.product.findFirst.mockResolvedValue(null);

        await expect(
            productService.deleteProduct(
                "user1",
                "prod1"
            )
        ).rejects.toThrow("Producto no encontrado.");
    });

    test("debe eliminar lógicamente el producto", async () => {

        prisma.product.findFirst.mockResolvedValue({
            id: "prod1"
        });

        prisma.product.update.mockResolvedValue({
            id: "prod1",
            deletedAt: new Date()
        });

        const result = await productService.deleteProduct(
            "user1",
            "prod1"
        );

        expect(result.deletedAt).toBeDefined();
    });
});

describe("adjustStock", () => {

    const product = {
        id: "prod1",
        userId: "user1",
        stockCurrent: 10,
        deletedAt: null
    };

    beforeEach(() => {
        prisma.product.findFirst.mockResolvedValue(product);

        prisma.$transaction.mockImplementation(
            async callback => callback({
                product: {
                    update: jest.fn()
                },
                stockMovement: {
                    create: jest.fn().mockResolvedValue({
                        id: "movement1",
                        quantity: 2
                    })
                }
            })
        );
    });

    test("debe rechazar producto inexistente", async () => {

        prisma.product.findFirst.mockResolvedValue(null);

        await expect(
            productService.adjustStock(
                "user1",
                "prod1",
                {
                    quantity: 2,
                    reason: "ENTRY"
                }
            )
        ).rejects.toThrow("Producto no encontrado.");
    });

    test("debe exigir quantity", async () => {

        await expect(
            productService.adjustStock(
                "user1",
                "prod1",
                {
                    reason: "ENTRY"
                }
            )
        ).rejects.toThrow("La cantidad es obligatoria.");
    });

    test("debe validar que quantity sea número", async () => {

        await expect(
            productService.adjustStock(
                "user1",
                "prod1",
                {
                    quantity: "2",
                    reason: "ENTRY"
                }
            )
        ).rejects.toThrow(
            "La cantidad debe ser un número."
        );
    });

    test("debe validar integer", async () => {

        await expect(
            productService.adjustStock(
                "user1",
                "prod1",
                {
                    quantity: 2.5,
                    reason: "ENTRY"
                }
            )
        ).rejects.toThrow(
            "La cantidad debe ser un número entero."
        );
    });

    test("debe rechazar cantidad cero", async () => {

        await expect(
            productService.adjustStock(
                "user1",
                "prod1",
                {
                    quantity: 0,
                    reason: "ENTRY"
                }
            )
        ).rejects.toThrow(
            "La cantidad debe ser mayor que cero."
        );
    });

    test("debe exigir reason", async () => {

        await expect(
            productService.adjustStock(
                "user1",
                "prod1",
                {
                    quantity: 2
                }
            )
        ).rejects.toThrow(
            "La razón del ajuste es obligatoria."
        );
    });

    test("debe rechazar reason inválido", async () => {

        await expect(
            productService.adjustStock(
                "user1",
                "prod1",
                {
                    quantity: 2,
                    reason: "INVALID"
                }
            )
        ).rejects.toThrow(
            "Razón de ajuste inválida."
        );
    });

    test("debe exigir dirección para corrección", async () => {

        await expect(
            productService.adjustStock(
                "user1",
                "prod1",
                {
                    quantity: 2,
                    reason: "CORRECTION"
                }
            )
        ).rejects.toThrow(
            "La dirección de la corrección es obligatoria."
        );
    });

    test("debe validar dirección de corrección", async () => {

        await expect(
            productService.adjustStock(
                "user1",
                "prod1",
                {
                    quantity: 2,
                    reason: "CORRECTION",
                    direction: "INVALID"
                }
            )
        ).rejects.toThrow(
            "La dirección de la corrección es inválida."
        );
    });

    test("debe permitir ENTRY", async () => {

        const result = await productService.adjustStock(
            "user1",
            "prod1",
            {
                quantity: 2,
                reason: "ENTRY"
            }
        );

        expect(result.quantity).toBe(2);
    });

    test("debe permitir DEVOLUTION", async () => {

        const result = await productService.adjustStock(
            "user1",
            "prod1",
            {
                quantity: 2,
                reason: "DEVOLUTION"
            }
        );

        expect(result).toBeDefined();
    });

    test("debe permitir LOSS", async () => {

        prisma.$transaction.mockImplementation(
            async callback => callback({
                product: {
                    update: jest.fn()
                },
                stockMovement: {
                    create: jest.fn().mockResolvedValue({
                        quantity: -2
                    })
                }
            })
        );

        const result = await productService.adjustStock(
            "user1",
            "prod1",
            {
                quantity: 2,
                reason: "LOSS"
            }
        );

        expect(result.quantity).toBe(-2);
    });

    test("debe permitir CORRECTION INCREASE", async () => {

        const result = await productService.adjustStock(
            "user1",
            "prod1",
            {
                quantity: 2,
                reason: "CORRECTION",
                direction: "INCREASE"
            }
        );

        expect(result).toBeDefined();
    });

    test("debe permitir CORRECTION DECREASE", async () => {

        prisma.$transaction.mockImplementation(
            async callback => callback({
                product: {
                    update: jest.fn()
                },
                stockMovement: {
                    create: jest.fn().mockResolvedValue({
                        quantity: -2
                    })
                }
            })
        );

        const result = await productService.adjustStock(
            "user1",
            "prod1",
            {
                quantity: 2,
                reason: "CORRECTION",
                direction: "DECREASE"
            }
        );

        expect(result.quantity).toBe(-2);
    });

    test("debe rechazar stock negativo", async () => {

        await expect(
            productService.adjustStock(
                "user1",
                "prod1",
                {
                    quantity: 11,
                    reason: "LOSS"
                }
            )
        ).rejects.toMatchObject({
            status: 422,
            message:
                "El ajuste de stock no puede resultar en un stock negativo."
        });

        expect(prisma.$transaction).not.toHaveBeenCalled();
    });
});

describe("getStockAdjustments", () => {

    test("debe rechazar producto inexistente", async () => {

        prisma.product.findFirst.mockResolvedValue(null);

        await expect(
            productService.getStockAdjustments(
                "user1",
                "prod1",
                {}
            )
        ).rejects.toThrow("Producto no encontrado.");
    });

    test("debe retornar movimientos", async () => {

        prisma.product.findFirst.mockResolvedValue({
            id: "prod1"
        });

        prisma.stockMovement.findMany.mockResolvedValue([
            {
                id: "movement1",
                quantity: -2
            }
        ]);

        prisma.stockMovement.count.mockResolvedValue(1);

        const result =
            await productService.getStockAdjustments(
                "user1",
                "prod1",
                {}
            );

        expect(result.data).toHaveLength(1);
        expect(result.pagination.total).toBe(1);
    });

    test("debe aceptar paginación personalizada", async () => {

        prisma.product.findFirst.mockResolvedValue({
            id: "prod1"
        });

        prisma.stockMovement.findMany.mockResolvedValue([]);
        prisma.stockMovement.count.mockResolvedValue(0);

        const result =
            await productService.getStockAdjustments(
                "user1",
                "prod1",
                {
                    page: "2",
                    limit: "5"
                }
            );

        expect(result.pagination.page).toBe(2);
        expect(result.pagination.limit).toBe(5);
    });
});
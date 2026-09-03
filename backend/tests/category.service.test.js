jest.mock("../src/config/prisma", () => ({
    category: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    },
    product: {
        findFirst: jest.fn()
    }
}));

const prisma = require("../src/config/prisma");
const categoryService = require("../src/services/category.service");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("getCategories", () => {

    test("debe retornar categorías", async () => {

        prisma.category.findMany.mockResolvedValue([
            {
                id: "cat1",
                name: "Tecnología",
                _count: {
                    products: 3
                }
            }
        ]);

        const result =
            await categoryService.getCategories("user1");

        expect(result).toHaveLength(1);

        expect(result[0]).toEqual({
            id: "cat1",
            name: "Tecnología",
            productCount: 3,
            _count: undefined
        });

        expect(prisma.category.findMany).toHaveBeenCalledWith({
            where: {
                userId: "user1",
                deletedAt: null
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
    });
});

describe("createCategory", () => {

    test("debe rechazar nombre inexistente", async () => {

        await expect(
            categoryService.createCategory(
                "user1",
                {}
            )
        ).rejects.toThrow(
            "El nombre de la categoría es obligatorio"
        );
    });

    test("debe rechazar nombre vacío", async () => {

        await expect(
            categoryService.createCategory(
                "user1",
                { name: " " }
            )
        ).rejects.toThrow(
            "El nombre de la categoría es obligatorio"
        );
    });

    test("debe rechazar más de 50 categorías", async () => {

        prisma.category.count.mockResolvedValue(50);

        await expect(
            categoryService.createCategory(
                "user1",
                { name: "Nueva" }
            )
        ).rejects.toThrow(
            "No puedes crear más de 50 categorías."
        );

        expect(prisma.category.count).toHaveBeenCalledWith({
            where: {
                userId: "user1",
                deletedAt: null
            }
        });
    });

    test("debe rechazar categoría duplicada", async () => {

        prisma.category.count.mockResolvedValue(1);

        prisma.category.findFirst.mockResolvedValue({
            id: "cat1",
            name: "Tecnología"
        });

        await expect(
            categoryService.createCategory(
                "user1",
                { name: "Tecnología" }
            )
        ).rejects.toThrow(
            "Ya existe una categoría con ese nombre."
        );
    });

    test("debe crear categoría", async () => {

        prisma.category.count.mockResolvedValue(1);

        prisma.category.findFirst.mockResolvedValue(null);

        prisma.category.create.mockResolvedValue({
            id: "cat1",
            name: "Tecnología",
            userId: "user1"
        });

        const result =
            await categoryService.createCategory(
                "user1",
                { name: " Tecnología " }
            );

        expect(result.name).toBe("Tecnología");
    });

    test("debe permitir el nombre de una categoría eliminada", async () => {

        prisma.category.count.mockResolvedValue(49);
        prisma.category.findFirst.mockResolvedValue(null);
        prisma.category.create.mockResolvedValue({
            id: "cat2",
            name: "Tecnología",
            userId: "user1",
            deletedAt: null
        });

        await categoryService.createCategory(
            "user1",
            { name: "Tecnología" }
        );

        expect(prisma.category.findFirst).toHaveBeenCalledWith({
            where: {
                userId: "user1",
                name: "Tecnología",
                deletedAt: null
            }
        });
    });
});

describe("updateCategory", () => {

    test("debe rechazar categoría inexistente", async () => {

        prisma.category.findFirst.mockResolvedValue(null);

        await expect(
            categoryService.updateCategory(
                "user1",
                "cat1",
                { name: "Nueva" }
            )
        ).rejects.toThrow("Categoría no encontrada");
    });

    test("no debe actualizar una categoría eliminada", async () => {

        prisma.category.findFirst.mockResolvedValue(null);

        await expect(
            categoryService.updateCategory(
                "user1",
                "cat-deleted",
                { name: "Nueva" }
            )
        ).rejects.toThrow("Categoría no encontrada");

        expect(prisma.category.update).not.toHaveBeenCalled();
    });

    test("debe rechazar nombre vacío", async () => {

        prisma.category.findFirst.mockResolvedValue({
            id: "cat1",
            userId: "user1",
            deletedAt: null
        });

        await expect(
            categoryService.updateCategory(
                "user1",
                "cat1",
                { name: " " }
            )
        ).rejects.toThrow(
            "El nombre de la categoría es obligatorio"
        );
    });

    test("debe rechazar nombre duplicado", async () => {

        prisma.category.findFirst.mockResolvedValue({
            id: "cat1"
        });

        prisma.category.findFirst
            .mockResolvedValueOnce({
                id: "cat1",
                userId: "user1",
                deletedAt: null
            })
            .mockResolvedValueOnce({
            id: "cat2",
            name: "Tecnología"
            });

        await expect(
            categoryService.updateCategory(
                "user1",
                "cat1",
                { name: "Tecnología" }
            )
        ).rejects.toThrow(
            "Ya existe una categoría con ese nombre."
        );
    });

    test("debe actualizar categoría", async () => {

        prisma.category.findFirst
            .mockResolvedValueOnce({
                id: "cat1",
                userId: "user1",
                deletedAt: null
            })
            .mockResolvedValueOnce(null);

        prisma.category.update.mockResolvedValue({
            id: "cat1",
            name: "Nueva"
        });

        const result =
            await categoryService.updateCategory(
                "user1",
                "cat1",
                { name: " Nueva " }
            );

        expect(result.name).toBe("Nueva");

        expect(prisma.category.findFirst).toHaveBeenNthCalledWith(1, {
            where: {
                id: "cat1",
                userId: "user1",
                deletedAt: null
            }
        });
    });
});

describe("deleteCategory", () => {

    test("debe rechazar categoría inexistente", async () => {

        prisma.category.findFirst.mockResolvedValue(null);

        await expect(
            categoryService.deleteCategory(
                "user1",
                "cat1"
            )
        ).rejects.toThrow("Categoría no encontrada");
    });

    test("debe rechazar categoría con productos", async () => {

        prisma.category.findFirst.mockResolvedValueOnce({
            id: "cat1",
            userId: "user1"
        });

        prisma.product.findFirst.mockResolvedValue({
            id: "prod1",
            categoryId: "cat1",
            userId: "user1"
        });

        await expect(
            categoryService.deleteCategory(
                "user1",
                "cat1"
            )
        ).rejects.toThrow(
            "No se puede eliminar la categoría porque tiene productos asociados."
        );

        expect(prisma.category.update).not.toHaveBeenCalled();

    });

    test("debe validar el usuario al eliminar una categoría", async () => {

        prisma.category.findFirst.mockResolvedValue(null);

        await expect(
            categoryService.deleteCategory(
                "user1",
                "cat-other-user"
            )
        ).rejects.toThrow("Categoría no encontrada");

        expect(prisma.category.findFirst).toHaveBeenCalledWith({
            where: {
                id: "cat-other-user",
                userId: "user1",
                deletedAt: null
            }
        });
    });

    test("debe eliminar categoría", async () => {

        prisma.category.findFirst.mockResolvedValueOnce({
            id: "cat1",
            userId: "user1",
            deletedAt: null
        });

        prisma.category.update.mockResolvedValue({
            id: "cat1",
            deletedAt: new Date()
        });

        const result =
            await categoryService.deleteCategory(
                "user1",
                "cat1"
            );

        expect(result.id).toBe("cat1");
        expect(prisma.category.update).toHaveBeenCalledWith({
            where: {
                id: "cat1"
            },
            data: {
                deletedAt: expect.any(Date)
            }
        });
    });

    test("debe eliminar categoría con productos eliminados", async () => {

        prisma.category.findFirst.mockResolvedValueOnce({
            id: "cat1",
            userId: "user1"
        });

        prisma.product.findFirst.mockResolvedValue(null);

        prisma.category.update.mockResolvedValue({
            id: "cat1",
            deletedAt: new Date()
        });

        const result = await categoryService.deleteCategory(
            "user1",
            "cat1"
        );

        expect(result.id).toBe("cat1");
        expect(prisma.category.update).toHaveBeenCalledWith({
            where: {
                id: "cat1"
            },
            data: {
                deletedAt: expect.any(Date)
            }
        });
        expect(prisma.product.findFirst).toHaveBeenCalledWith({
            where: {
                categoryId: "cat1",
                userId: "user1",
                deletedAt: null
            }
        });
    });
});
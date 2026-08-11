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
                userId: "user1"
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
});

describe("updateCategory", () => {

    test("debe rechazar categoría inexistente", async () => {

        prisma.category.findUnique.mockResolvedValue(null);

        await expect(
            categoryService.updateCategory(
                "user1",
                "cat1",
                { name: "Nueva" }
            )
        ).rejects.toThrow("Categoría no encontrada");
    });

    test("debe rechazar nombre vacío", async () => {

        prisma.category.findUnique.mockResolvedValue({
            id: "cat1"
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

        prisma.category.findUnique.mockResolvedValue({
            id: "cat1"
        });

        prisma.category.findFirst.mockResolvedValue({
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

        prisma.category.findUnique.mockResolvedValue({
            id: "cat1"
        });

        prisma.category.findFirst.mockResolvedValue(null);

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

        expect(prisma.category.delete).not.toHaveBeenCalled();

    });

    test("debe eliminar categoría", async () => {

        prisma.category.findFirst
            .mockResolvedValueOnce({
                id: "cat1"
            })
            .mockResolvedValueOnce(null);

        prisma.category.delete.mockResolvedValue({
            id: "cat1"
        });

        const result =
            await categoryService.deleteCategory(
                "user1",
                "cat1"
            );

        expect(result.id).toBe("cat1");
    });
});
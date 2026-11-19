jest.mock("../src/services/product.service", () => ({
    createProduct: jest.fn(),
    getProducts: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    adjustStock: jest.fn(),
    getStockAdjustments: jest.fn(),
    generateSku: jest.fn(),
    importProductsFromExcel: jest.fn(),
    generateExcelTemplate: jest.fn()
}));

const productService =
    require("../src/services/product.service");

const controller =
    require("../src/controllers/product.controller");

function mockResponse() {

    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("product.controller", () => {

    test("createProduct exitoso", async () => {

        const req = {
            user: { id: "user1" },
            body: { name: "Mouse" }
        };

        const res = mockResponse();

        productService.createProduct.mockResolvedValue({
            id: "prod1"
        });

        await controller.createProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalled();
    });

    test("createProduct error", async () => {

        const req = {
            user: { id: "user1" },
            body: {}
        };

        const res = mockResponse();

        productService.createProduct.mockRejectedValue(
            new Error("Error")
        );

        await controller.createProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("getProducts exitoso", async () => {

        const req = {
            user: { id: "user1" },
            query: {}
        };

        const res = mockResponse();

        productService.getProducts.mockResolvedValue({
            data: []
        });

        await controller.getProducts(req, res);

        expect(res.json).toHaveBeenCalledWith({
            data: []
        });
    });

    test("getProducts error", async () => {

        const req = {
            user: { id: "user1" },
            query: {}
        };

        const res = mockResponse();

        productService.getProducts.mockRejectedValue(
            new Error("Error")
        );

        await controller.getProducts(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("updateProduct exitoso", async () => {

        const req = {
            user: { id: "user1" },
            params: { id: "prod1" },
            body: {}
        };

        const res = mockResponse();

        productService.updateProduct.mockResolvedValue({
            id: "prod1"
        });

        await controller.updateProduct(req, res);

        expect(res.json).toHaveBeenCalled();
    });

    test("updateProduct error", async () => {

        const req = {
            user: { id: "user1" },
            params: { id: "prod1" },
            body: {}
        };

        const res = mockResponse();

        productService.updateProduct.mockRejectedValue(
            new Error("Error")
        );

        await controller.updateProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("deleteProduct exitoso", async () => {

        const req = {
            user: { id: "user1" },
            params: { id: "prod1" }
        };

        const res = mockResponse();

        productService.deleteProduct.mockResolvedValue({
            id: "prod1"
        });

        await controller.deleteProduct(req, res);

        expect(res.json).toHaveBeenCalled();
    });

    test("deleteProduct error", async () => {

        const req = {
            user: { id: "user1" },
            params: { id: "prod1" }
        };

        const res = mockResponse();

        productService.deleteProduct.mockRejectedValue(
            new Error("Error")
        );

        await controller.deleteProduct(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("adjustStock exitoso", async () => {

        const req = {
            user: { id: "user1" },
            params: { id: "prod1" },
            body: {}
        };

        const res = mockResponse();

        productService.adjustStock.mockResolvedValue({
            id: "movement1"
        });

        await controller.adjustStock(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test("adjustStock usa error.status", async () => {

        const req = {
            user: { id: "user1" },
            params: { id: "prod1" },
            body: {}
        };

        const res = mockResponse();

        const error = new Error("Stock negativo");
        error.status = 422;

        productService.adjustStock.mockRejectedValue(error);

        await controller.adjustStock(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
    });

    test("adjustStock usa 400 cuando error no tiene status", async () => {

        const req = {
            user: { id: "user1" },
            params: { id: "prod1" },
            body: {}
        };

        const res = mockResponse();

        productService.adjustStock.mockRejectedValue(
            new Error("Error")
        );

        await controller.adjustStock(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("getStockAdjustments exitoso", async () => {

        const req = {
            user: { id: "user1" },
            params: { id: "prod1" },
            query: {}
        };

        const res = mockResponse();

        productService.getStockAdjustments.mockResolvedValue([]);

        await controller.getStockAdjustments(req, res);

        expect(res.json).toHaveBeenCalledWith([]);
    });

    test("getStockAdjustments error", async () => {

        const req = {
            user: { id: "user1" },
            params: { id: "prod1" },
            query: {}
        };

        const res = mockResponse();

        productService.getStockAdjustments.mockRejectedValue(
            new Error("Error")
        );

        await controller.getStockAdjustments(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test("getStockAdjustments error con status", async () => {

        const req = {
            user: { id: "user1" },
            params: { id: "prod1" },
            query: {}
        };

        const res = mockResponse();

        const error = new Error("Error");
        error.status = 422;

        productService.getStockAdjustments.mockRejectedValue(error);

        await controller.getStockAdjustments(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
    });

    test("generateSku exitoso", async () => {

        const req = {
            user: { id: "user1" },
            query: {
                categoryId: "cat1"
            }
        };

        const res = mockResponse();

        productService.generateSku.mockResolvedValue(
            "TEC-0001"
        );

        await controller.generateSku(req, res, jest.fn());

        expect(res.json).toHaveBeenCalledWith({
            sku: "TEC-0001"
        });
    });

    test("generateSku debe llamar next cuando hay error", async () => {

        const req = {
            user: { id: "user1" },
            query: {
                categoryId: "cat1"
            }
        };

        const res = mockResponse();
        const next = jest.fn();

        const error = new Error("Error");

        productService.generateSku.mockRejectedValue(error);

        await controller.generateSku(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    test("importProductsFromExcel debe retornar 400 si no hay archivo", async () => {
        const req = {
            user: { id: "user1" }
        };
        const res = mockResponse();

        await controller.importProductsFromExcel(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "No se proporcionó ningún archivo."
        });
    });

    test("importProductsFromExcel debe retornar 200 con resultado exitoso", async () => {
        const req = {
            user: { id: "user1" },
            file: { originalname: "test.xlsx", buffer: Buffer.from("data") }
        };
        const res = mockResponse();

        productService.importProductsFromExcel.mockResolvedValue({
            created_products: 5,
            created_categories: 2,
            createdProducts: 5,
            createdCategories: 2
        });

        await controller.importProductsFromExcel(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            created_products: 5,
            created_categories: 2,
            createdProducts: 5,
            createdCategories: 2
        });
    });

    test("importProductsFromExcel debe retornar 422 con errores si la validación falla", async () => {
        const req = {
            user: { id: "user1" },
            file: { originalname: "test.xlsx", buffer: Buffer.from("data") }
        };
        const res = mockResponse();

        const valError = new Error("Errores de validación");
        valError.status = 422;
        valError.errors = [{ row: 2, field: "precio", message: "inválido" }];
        valError.details = ["Fila 2: inválido"];

        productService.importProductsFromExcel.mockRejectedValue(valError);

        await controller.importProductsFromExcel(req, res);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith({
            message: "Errores de validación",
            errors: valError.errors,
            details: valError.details
        });
    });

    test("downloadExcelTemplate debe enviar el buffer con headers correctos", async () => {
        const req = {};
        const res = {
            setHeader: jest.fn(),
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        const mockBuffer = Buffer.from("fake-excel-data");
        productService.generateExcelTemplate.mockReturnValue(mockBuffer);

        await controller.downloadExcelTemplate(req, res);

        expect(res.setHeader).toHaveBeenCalledWith(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        expect(res.setHeader).toHaveBeenCalledWith(
            "Content-Disposition",
            "attachment; filename=plantilla_productos.xlsx"
        );
        expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });

    test("downloadExcelTemplate debe retornar 500 en caso de error", async () => {
        const req = {};
        const res = {
            setHeader: jest.fn(),
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        productService.generateExcelTemplate.mockImplementation(() => {
            throw new Error("Template failure");
        });

        await controller.downloadExcelTemplate(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Template failure"
        });
    });
});
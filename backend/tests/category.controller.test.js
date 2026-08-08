jest.mock("../src/services/category.service", () => ({
    getCategories: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn()
}));

const categoryService =
    require("../src/services/category.service");

const controller =
    require("../src/controllers/category.controller");

function response() {

    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
}

beforeEach(() => {
    jest.clearAllMocks();
});

test("getCategories exitoso", async () => {

    const req = {
        user: {
            id: "user1"
        }
    };

    const res = response();

    categoryService.getCategories.mockResolvedValue([]);

    await controller.getCategories(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
});

test("getCategories error", async () => {

    const req = {
        user: {
            id: "user1"
        }
    };

    const res = response();

    categoryService.getCategories.mockRejectedValue(
        new Error("Error")
    );

    await controller.getCategories(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
});

test("createCategory exitoso", async () => {

    const req = {
        user: { id: "user1" },
        body: {
            name: "Tecnología"
        }
    };

    const res = response();

    categoryService.createCategory.mockResolvedValue({
        id: "cat1"
    });

    await controller.createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
});

test("createCategory error", async () => {

    const req = {
        user: { id: "user1" },
        body: {}
    };

    const res = response();

    categoryService.createCategory.mockRejectedValue(
        new Error("Error")
    );

    await controller.createCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
});

test("updateCategory exitoso", async () => {

    const req = {
        user: { id: "user1" },
        params: { id: "cat1" },
        body: {
            name: "Nueva"
        }
    };

    const res = response();

    categoryService.updateCategory.mockResolvedValue({
        id: "cat1"
    });

    await controller.updateCategory(req, res);

    expect(res.json).toHaveBeenCalled();
});

test("updateCategory error", async () => {

    const req = {
        user: { id: "user1" },
        params: { id: "cat1" },
        body: {}
    };

    const res = response();

    categoryService.updateCategory.mockRejectedValue(
        new Error("Error")
    );

    await controller.updateCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
});

test("deleteCategory exitoso", async () => {

    const req = {
        user: { id: "user1" },
        params: { id: "cat1" }
    };

    const res = response();

    categoryService.deleteCategory.mockResolvedValue({
        id: "cat1"
    });

    await controller.deleteCategory(req, res);

    expect(res.json).toHaveBeenCalled();
});

test("deleteCategory error", async () => {

    const req = {
        user: { id: "user1" },
        params: { id: "cat1" }
    };

    const res = response();

    categoryService.deleteCategory.mockRejectedValue(
        new Error("Error")
    );

    await controller.deleteCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
});
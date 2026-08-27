jest.mock("../src/services/sale.service", () => ({
    createSale: jest.fn(),
    getSales: jest.fn()
}));

const saleService =
    require("../src/services/sale.service");

const controller =
    require("../src/controllers/sale.controller");

function response() {

    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
}

beforeEach(() => {
    jest.clearAllMocks();
});

test("createSale exitoso", async () => {

    const req = {
        user: {
            id: "user1"
        },
        body: {
            items: []
        }
    };

    const res = response();

    saleService.createSale.mockResolvedValue({
        id: "sale1"
    });

    await controller.createSale(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
});

test("createSale error", async () => {

    const req = {
        user: {
            id: "user1"
        },
        body: {}
    };

    const res = response();

    saleService.createSale.mockRejectedValue(
        new Error("Error")
    );

    await controller.createSale(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
});

test("getSales exitoso", async () => {
    const res = response();
    const sales = {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
    };
    saleService.getSales.mockResolvedValue(sales);

    await controller.getSales(
        {
            user: { id: "user1" },
            query: { page: "2", startDate: "2026-08-01" }
        },
        res
    );

    expect(saleService.getSales).toHaveBeenCalledWith(
        "user1",
        { page: "2", startDate: "2026-08-01" }
    );
    expect(res.json).toHaveBeenCalledWith(sales);
});

test("getSales error", async () => {
    const res = response();
    saleService.getSales.mockRejectedValue(new Error("Error"));

    await controller.getSales(
        { user: { id: "user1" }, query: {} },
        res
    );

    expect(res.status).toHaveBeenCalledWith(400);
});
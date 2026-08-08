jest.mock("../src/services/sale.service", () => ({
    createSale: jest.fn()
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
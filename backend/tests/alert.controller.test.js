jest.mock("../src/services/alert.service", () => ({
    getAlerts: jest.fn(),
    markAsRead: jest.fn()
}));

const alertService =
    require("../src/services/alert.service");

const controller =
    require("../src/controllers/alert.controller");

function response() {

    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
}

beforeEach(() => {
    jest.clearAllMocks();
});

test("getAlerts exitoso", async () => {

    const req = {
        user: {
            id: "user1"
        }
    };

    const res = response();

    alertService.getAlerts.mockResolvedValue([]);

    await controller.getAlerts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
});

test("getAlerts error", async () => {

    const req = {
        user: {
            id: "user1"
        }
    };

    const res = response();

    alertService.getAlerts.mockRejectedValue(
        new Error("Error")
    );

    await controller.getAlerts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
});

test("markAlertAsRead exitoso", async () => {

    const req = {
        user: {
            id: "user1"
        },
        params: {
            id: "alert1"
        }
    };

    const res = response();

    alertService.markAsRead.mockResolvedValue({
        id: "alert1"
    });

    await controller.markAlertAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
});

test("markAlertAsRead error", async () => {

    const req = {
        user: {
            id: "user1"
        },
        params: {
            id: "alert1"
        }
    };

    const res = response();

    alertService.markAsRead.mockRejectedValue(
        new Error("Alerta no encontrada.")
    );

    await controller.markAlertAsRead(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
});
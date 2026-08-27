jest.mock("../src/services/prediction.service", () => ({
    getPredictions: jest.fn()
}));

const predictionService = require("../src/services/prediction.service");
const controller = require("../src/controllers/prediction.controller");

function response() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

test("getPredictions devuelve predicciones del usuario", async () => {
    const predictions = [
        {
            productId: "product1",
            forecast7d: 4
        }
    ];
    const res = response();
    predictionService.getPredictions.mockResolvedValue(predictions);

    await controller.getPredictions(
        { user: { id: "user1" } },
        res,
        jest.fn()
    );

    expect(predictionService.getPredictions).toHaveBeenCalledWith("user1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(predictions);
});

test("getPredictions delega errores", async () => {
    const error = new Error("Error de predicciones");
    const next = jest.fn();
    predictionService.getPredictions.mockRejectedValue(error);

    await controller.getPredictions(
        { user: { id: "user1" } },
        response(),
        next
    );

    expect(next).toHaveBeenCalledWith(error);
});

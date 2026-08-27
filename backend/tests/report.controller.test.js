jest.mock("../src/services/report.service", () => ({
    getSalesReport: jest.fn()
}));

const reportService = require("../src/services/report.service");
const controller = require("../src/controllers/report.controller");

function response() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
}

test("getSalesReport devuelve el reporte", async () => {
    const report = {
        totalSales: 1,
        totalRevenue: 10,
        topProducts: [],
        grouped: []
    };
    const res = response();
    reportService.getSalesReport.mockResolvedValue(report);

    await controller.getSalesReport(
        {
            user: { id: "user1" },
            query: {
                from: "2026-08-01",
                to: "2026-08-27",
                groupBy: "month"
            }
        },
        res,
        jest.fn()
    );

    expect(reportService.getSalesReport).toHaveBeenCalledWith({
        userId: "user1",
        from: "2026-08-01",
        to: "2026-08-27",
        groupBy: "month"
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(report);
});

test("getSalesReport delega errores", async () => {
    const error = new Error("Formato de fecha inválido");
    const next = jest.fn();
    reportService.getSalesReport.mockRejectedValue(error);

    await controller.getSalesReport(
        { user: { id: "user1" }, query: {} },
        response(),
        next
    );

    expect(next).toHaveBeenCalledWith(error);
});

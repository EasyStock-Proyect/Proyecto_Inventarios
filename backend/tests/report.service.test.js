jest.mock("../src/config/prisma", () => ({
    sale: {
        findMany: jest.fn()
    }
}));

const prisma = require("../src/config/prisma");
const reportService = require("../src/services/report.service");

const sales = [
    {
        id: "sale-1",
        total: 100,
        createdAt: new Date("2026-08-10T10:00:00.000Z"),
        items: [
            {
                quantity: 2,
                subtotal: 100,
                product: { name: "Cafe" }
            },
            {
                quantity: 1,
                subtotal: 50,
                product: { name: "Pan" }
            }
        ]
    },
    {
        id: "sale-2",
        total: 50,
        createdAt: new Date("2026-08-11T10:00:00.000Z"),
        items: [
            {
                quantity: 1,
                subtotal: 50,
                product: { name: "Cafe" }
            }
        ]
    }
];

describe("getSalesReport", () => {
    beforeEach(() => {
        prisma.sale.findMany.mockResolvedValue(sales);
    });

    test("calcula totales y productos más vendidos", async () => {
        const report = await reportService.getSalesReport({
            userId: "user-totals",
            from: "2026-08-10",
            to: "2026-08-11",
            groupBy: "day"
        });

        expect(report.totalSales).toBe(2);
        expect(report.totalRevenue).toBe(150);
        expect(report.topProducts).toEqual([
            { name: "Cafe", unitsSold: 3, percentage: 75 },
            { name: "Pan", unitsSold: 1, percentage: 25 }
        ]);
        expect(report.grouped).toHaveLength(2);
    });

    test.each(["day", "week", "month"])(
        "agrupa las ventas por %s",
        async groupBy => {
            const report = await reportService.getSalesReport({
                userId: `user-${groupBy}`,
                from: "2026-08-10",
                to: "2026-08-11",
                groupBy
            });

            expect(report.grouped).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        totalSales: groupBy === "day" ? 1 : 2
                    })
                ])
            );
        }
    );

    test("cachea por cinco minutos los períodos pasados", async () => {
        const params = {
            userId: "user-cache",
            from: "2020-01-01",
            to: "2020-01-31",
            groupBy: "month"
        };

        const firstReport = await reportService.getSalesReport(params);
        const secondReport = await reportService.getSalesReport(params);

        expect(secondReport).toBe(firstReport);
        expect(prisma.sale.findMany).toHaveBeenCalledTimes(1);
    });
});

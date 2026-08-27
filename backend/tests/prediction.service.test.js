jest.mock("../src/config/prisma", () => ({
    demandPrediction: {
        findMany: jest.fn()
    }
}));

const prisma = require("../src/config/prisma");
const predictionService = require("../src/services/prediction.service");

beforeEach(() => {
    jest.clearAllMocks();
    predictionService.clearPredictionsCache();
    jest.useRealTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

function prediction(overrides = {}) {
    return {
        productId: "product-1",
        forecastDate: new Date("2026-08-28T00:00:00.000Z"),
        predictedQuantity: 2.2,
        lowerBound: 1.1,
        upperBound: 3.2,
        hasEnoughData: true,
        product: {
            id: "product-1",
            name: "Cafe",
            stockCurrent: 5
        },
        ...overrides
    };
}

test("obtiene y agrega predicciones por producto", async () => {
    jest.useFakeTimers().setSystemTime(
        new Date("2026-08-27T15:30:00.000Z")
    );

    prisma.demandPrediction.findMany.mockResolvedValue([
        prediction(),
        prediction({
            forecastDate: new Date("2026-08-29T00:00:00.000Z"),
            predictedQuantity: 1.8,
            lowerBound: 0.4,
            upperBound: 2.1
        }),
        prediction({
            productId: "product-2",
            product: {
                id: "product-2",
                name: "Te",
                stockCurrent: 1
            },
            predictedQuantity: 1,
            lowerBound: 0,
            upperBound: 4
        })
    ]);

    const result = await predictionService.getPredictions("user-1");

    expect(prisma.demandPrediction.findMany).toHaveBeenCalledWith({
        where: {
            userId: "user-1",
            forecastDate: {
                gte: new Date("2026-08-27T00:00:00.000Z"),
                lt: new Date("2026-09-03T00:00:00.000Z")
            },
            product: {
                deletedAt: null
            }
        },
        orderBy: [
            { product: { name: "asc" } },
            { forecastDate: "asc" }
        ],
        include: {
            product: {
                select: {
                    id: true,
                    name: true,
                    stockCurrent: true
                }
            }
        }
    });

    expect(result).toEqual([
        {
            productId: "product-1",
            productName: "Cafe",
            forecast7d: 4,
            currentStock: 5,
            recommendedOrder: 1,
            confidence: {
                lowerBound: 2,
                upperBound: 6
            },
            hasEnoughData: true,
            recommendationReliable: true
        },
        {
            productId: "product-2",
            productName: "Te",
            forecast7d: 1,
            currentStock: 1,
            recommendedOrder: 3,
            confidence: {
                lowerBound: 0,
                upperBound: 4
            },
            hasEnoughData: true,
            recommendationReliable: true
        }
    ]);
});

test("mantiene aislamiento por userId y devuelve lista vacia sin datos", async () => {
    prisma.demandPrediction.findMany.mockResolvedValue([]);

    const result = await predictionService.getPredictions("user-2");

    expect(result).toEqual([]);
    expect(prisma.demandPrediction.findMany.mock.calls[0][0].where.userId)
        .toBe("user-2");
});

test("marca la prediccion como no confiable si falta historial suficiente", async () => {
    prisma.demandPrediction.findMany.mockResolvedValue([
        prediction({ hasEnoughData: false })
    ]);

    const result = await predictionService.getPredictions("user-1");

    expect(result[0].hasEnoughData).toBe(false);
    expect(result[0].recommendationReliable).toBe(false);
});

test("usa la recomendacion cero cuando el stock supera el limite superior", async () => {
    prisma.demandPrediction.findMany.mockResolvedValue([
        prediction({
            product: {
                id: "product-1",
                name: "Cafe",
                stockCurrent: 20
            },
            upperBound: 3
        })
    ]);

    const result = await predictionService.getPredictions("user-1");

    expect(result[0].recommendedOrder).toBe(0);
});

test("devuelve la respuesta cacheada durante una hora", async () => {
    prisma.demandPrediction.findMany.mockResolvedValue([
        prediction()
    ]);

    const firstResult = await predictionService.getPredictions("user-1");
    prisma.demandPrediction.findMany.mockResolvedValue([
        prediction({ predictedQuantity: 99 })
    ]);

    const secondResult = await predictionService.getPredictions("user-1");

    expect(secondResult).toEqual(firstResult);
    expect(prisma.demandPrediction.findMany).toHaveBeenCalledTimes(1);
});

test("consulta nuevamente cuando expira la cache", async () => {
    jest.useFakeTimers().setSystemTime(
        new Date("2026-08-27T00:00:00.000Z")
    );
    prisma.demandPrediction.findMany.mockResolvedValue([
        prediction()
    ]);

    await predictionService.getPredictions("user-1");
    jest.advanceTimersByTime(60 * 60 * 1000 + 1);
    prisma.demandPrediction.findMany.mockResolvedValue([
        prediction({ predictedQuantity: 8 })
    ]);

    const result = await predictionService.getPredictions("user-1");

    expect(prisma.demandPrediction.findMany).toHaveBeenCalledTimes(2);
    expect(result[0].forecast7d).toBe(8);
});

test("limpia la cache de un usuario o de todos los usuarios", async () => {
    prisma.demandPrediction.findMany.mockResolvedValue([
        prediction()
    ]);

    await predictionService.getPredictions("user-1");
    await predictionService.getPredictions("user-2");
    predictionService.clearPredictionsCache("user-1");
    await predictionService.getPredictions("user-1");

    expect(prisma.demandPrediction.findMany).toHaveBeenCalledTimes(3);

    predictionService.clearPredictionsCache();
    await predictionService.getPredictions("user-2");

    expect(prisma.demandPrediction.findMany).toHaveBeenCalledTimes(4);
});

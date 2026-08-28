const prisma = require("../config/prisma");

const CACHE_TTL = 60 * 60 * 1000; // 1 hora

const predictionCache = new Map();

function getCacheKey(userId) {
    return `predictions:${userId}`;
}

function getDateRange() {
    const today = new Date();

    today.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setUTCDate(endDate.getUTCDate() + 7);

    return {
        today,
        endDate
    };
}

async function getPredictions(userId) {

    const cacheKey = getCacheKey(userId);
    const cached = predictionCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    if (cached) {
        predictionCache.delete(cacheKey);
    }

    const { today, endDate } = getDateRange();

    const predictions = await prisma.demandPrediction.findMany({
        where: {
            userId,
            forecastDate: {
                gte: today,
                lt: endDate
            },
            product: {
                deletedAt: null
            }
        },
        orderBy: [
            {
                product: {
                    name: "asc"
                }
            },
            {
                forecastDate: "asc"
            }
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

    const grouped = new Map();

    for (const prediction of predictions) {

        const productId = prediction.productId;

        if (!grouped.has(productId)) {
            grouped.set(productId, {
                productId,
                productName: prediction.product.name,
                forecast7d: 0,
                currentStock: prediction.product.stockCurrent,
                confidence: {
                    lowerBound: 0,
                    upperBound: 0
                },
                hasEnoughData: true
            });
        }

        const productPrediction = grouped.get(productId);

        productPrediction.forecast7d += Number(
            prediction.predictedQuantity
        );

        productPrediction.confidence.lowerBound += Number(
            prediction.lowerBound
        );

        productPrediction.confidence.upperBound += Number(
            prediction.upperBound
        );

        if (!prediction.hasEnoughData) {
            productPrediction.hasEnoughData = false;
        }
    }

    const result = Array.from(grouped.values()).map(
        (productPrediction) => {

            const recommendedOrder = Math.max(
                0,
                Math.ceil(
                    productPrediction.confidence.upperBound -
                    productPrediction.currentStock
                )
            );

            return {
                productId: productPrediction.productId,
                productName: productPrediction.productName,

                // Demanda total estimada para los próximos 7 días.
                forecast7d: Math.ceil(
                    productPrediction.forecast7d
                ),

                // Stock actual del producto.
                currentStock: productPrediction.currentStock,

                // Cantidad sugerida para el próximo pedido.
                recommendedOrder,

                // Rango de demanda estimada para los 7 días.
                confidence: {
                    lowerBound: Math.ceil(
                        productPrediction.confidence.lowerBound
                    ),
                    upperBound: Math.ceil(
                        productPrediction.confidence.upperBound
                    )
                },

                // Indica si el modelo cuenta con al menos 30 días
                // de historial para considerar confiable la predicción.
                hasEnoughData: productPrediction.hasEnoughData,

                // Permite al frontend saber si puede presentar
                // la recomendación como confiable.
                recommendationReliable: productPrediction.hasEnoughData
            };
        }
    );

    predictionCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + CACHE_TTL
    });

    return result;
}

function clearPredictionsCache(userId) {

    if (userId) {
        predictionCache.delete(getCacheKey(userId));
        return;
    }

    predictionCache.clear();
}

async function getPredictionDetail(userId, productId) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const historyStart = new Date(today);
    historyStart.setDate(historyStart.getDate() - 13);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const forecastEnd = new Date(today);
    forecastEnd.setDate(forecastEnd.getDate() + 7);

    const product = await prisma.product.findFirst({
        where: {
            id: productId,
            userId,
            deletedAt: null
        },
        select: {
            id: true,
            name: true,
            stockCurrent: true
        }
    });

    if (!product) {
        const error = new Error("Producto no encontrado.");
        error.status = 404;
        throw error;
    }

    const [sales, predictions] = await Promise.all([
        prisma.saleItem.findMany({
            where: {
                productId,
                sale: {
                    userId,
                    createdAt: {
                        gte: historyStart,
                        lt: tomorrow
                    }
                }
            },
            select: {
                quantity: true,
                sale: {
                    select: {
                        createdAt: true
                    }
                }
            },
            orderBy: {
                sale: {
                    createdAt: "asc"
                }
            }
        }),

        prisma.demandPrediction.findMany({
            where: {
                userId,
                productId,
                forecastDate: {
                    gte: today,
                    lt: forecastEnd
                }
            },
            orderBy: {
                forecastDate: "asc"
            },
            select: {
                forecastDate: true,
                predictedQuantity: true,
                lowerBound: true,
                upperBound: true,
                hasEnoughData: true,
                trainingDays: true
            }
        })
    ]);

    const historyMap = new Map();

    for (let index = 0; index < 14; index++) {

        const date = new Date(historyStart);
        date.setDate(date.getDate() + index);

        const key = date.toISOString().split("T")[0];

        historyMap.set(key, 0);
    }

    for (const saleItem of sales) {

        const key = new Date(
            saleItem.sale.createdAt
        ).toISOString().split("T")[0];

        if (historyMap.has(key)) {
            historyMap.set(
                key,
                historyMap.get(key) + saleItem.quantity
            );
        }
    }

    const history = Array.from(
        historyMap.entries()
    ).map(([date, quantity]) => ({
        date,
        quantity
    }));

    const predictionMap = new Map();

    for (const prediction of predictions) {

        const date =
            new Date(prediction.forecastDate)
                .toISOString()
                .split("T")[0];

        predictionMap.set(date, {
            date,
            predictedQuantity:
                Number(prediction.predictedQuantity),
            lowerBound:
                Number(prediction.lowerBound),
            upperBound:
                Number(prediction.upperBound)
        });
    }

    const forecast = [];

    for (let index = 1; index <= 7; index++) {

        const date = new Date(today);
        date.setDate(date.getDate() + index);

        const key = date.toISOString().split("T")[0];

        forecast.push(
            predictionMap.get(key) || {
                date: key,
                predictedQuantity: null,
                lowerBound: null,
                upperBound: null
            }
        );
    }

    const availablePredictions =
        predictions;

    const forecast7d =
        availablePredictions.reduce(
            (total, prediction) =>
                total +
                Number(prediction.predictedQuantity),
            0
        );

    const lowerBound =
        availablePredictions.reduce(
            (total, prediction) =>
                total +
                Number(prediction.lowerBound),
            0
        );

    const upperBound =
        availablePredictions.reduce(
            (total, prediction) =>
                total +
                Number(prediction.upperBound),
            0
        );

    const hasEnoughData =
        availablePredictions.length > 0 &&
        availablePredictions.every(
            (prediction) =>
                prediction.hasEnoughData
        );

    const trainingDays =
        availablePredictions.length > 0
            ? Math.max(
                ...availablePredictions.map(
                    (prediction) =>
                        prediction.trainingDays
                )
            )
            : 0;

    const recommendedOrder = Math.max(
        0,
        Math.ceil(
            upperBound -
            product.stockCurrent
        )
    );

    return {
        productId: product.id,
        productName: product.name,
        currentStock: product.stockCurrent,
        forecast7d: Math.ceil(forecast7d),
        recommendedOrder,
        confidence: {
            lowerBound: Math.ceil(lowerBound),
            upperBound: Math.ceil(upperBound)
        },
        hasEnoughData,
        trainingDays,
        history,
        forecast
    };
}

module.exports = {
    getPredictions,
    clearPredictionsCache,
    getPredictionDetail
};
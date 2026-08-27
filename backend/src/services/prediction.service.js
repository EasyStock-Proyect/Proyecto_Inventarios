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

module.exports = {
    getPredictions,
    clearPredictionsCache
};
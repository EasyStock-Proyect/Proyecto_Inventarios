const prisma = require("../config/prisma");

const CACHE_DURATION = 5 * 60 * 1000;

const reportCache = new Map();

const getCacheKey = (
    userId,
    from,
    to,
    groupBy
) => {
    return `${userId}:${from}:${to}:${groupBy}`;
};

const isPastPeriod = (to) => {
    if (!to) {
        return false;
    }

    const endDate = new Date(to);

    if (Number.isNaN(endDate.getTime())) {
        return false;
    }

    endDate.setHours(23, 59, 59, 999);

    return endDate < new Date();
};

const getPeriodStart = (date, groupBy) => {
    const result = new Date(date);

    if (groupBy === "day") {
        result.setHours(0, 0, 0, 0);
    }

    if (groupBy === "week") {
        result.setHours(0, 0, 0, 0);

        const day = result.getDay();
        const difference = day === 0 ? 6 : day - 1;

        result.setDate(result.getDate() - difference);
    }

    if (groupBy === "month") {
        result.setHours(0, 0, 0, 0);
        result.setDate(1);
    }

    return result;
};

const getSalesReport = async ({
    userId,
    from,
    to,
    groupBy = "day"
}) => {

    if (!userId) {
        throw new Error("Usuario no identificado");
    }

    if (!["day", "week", "month"].includes(groupBy)) {
        throw new Error(
            "groupBy debe ser day, week o month"
        );
    }

    let fromDate;

    let toDate;

    if (from) {
        fromDate = new Date(`${from}T00:00:00`);
    }

    if (to) {
        toDate = new Date(`${to}T23:59:59.999`);
    }

    if (
        (from && Number.isNaN(fromDate.getTime())) ||
        (to && Number.isNaN(toDate.getTime()))
    ) {
        throw new Error("Formato de fecha inválido");
    }

    if (
        fromDate &&
        toDate &&
        fromDate > toDate
    ) {
        throw new Error(
            "La fecha inicial no puede ser mayor que la fecha final"
        );
    }

    const cacheKey = getCacheKey(
        userId,
        from || "",
        to || "",
        groupBy
    );

    const shouldUseCache = isPastPeriod(to);

    if (shouldUseCache) {

        const cached = reportCache.get(cacheKey);

        if (
            cached &&
            Date.now() - cached.createdAt <
                CACHE_DURATION
        ) {
            return cached.data;
        }

    }

    const where = {
        userId
    };

    if (fromDate || toDate) {

        where.createdAt = {};

        if (fromDate) {
            where.createdAt.gte = fromDate;
        }

        if (toDate) {
            where.createdAt.lte = toDate;
        }

    }

    const sales = await prisma.sale.findMany({
        where,
        select: {
            id: true,
            total: true,
            createdAt: true,
            items: {
                select: {
                    quantity: true,
                    subtotal: true,
                    product: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    let totalRevenue = 0;

    const productsMap = new Map();

    const groupedSales = new Map();

    for (const sale of sales) {

        const saleTotal = Number(sale.total);

        totalRevenue += saleTotal;

        const periodStart = getPeriodStart(
            sale.createdAt,
            groupBy
        );

        const periodKey =
            periodStart.toISOString();

        if (!groupedSales.has(periodKey)) {

            groupedSales.set(
                periodKey,
                {
                    period: periodKey,
                    totalSales: 0,
                    totalRevenue: 0
                }
            );

        }

        const period =
            groupedSales.get(periodKey);

        period.totalSales += 1;
        period.totalRevenue += saleTotal;

        for (const item of sale.items) {

            const productName =
                item.product?.name ||
                "Producto eliminado";

            const current =
                productsMap.get(productName) || {
                    name: productName,
                    unitsSold: 0
                };

            current.unitsSold += Number(
                item.quantity
            );

            productsMap.set(
                productName,
                current
            );

        }

    }

    const totalUnitsSold =
        Array.from(productsMap.values())
            .reduce(
                (total, product) =>
                    total + product.unitsSold,
                0
            );

    const topProducts =
        Array.from(productsMap.values())
            .sort(
                (a, b) =>
                    b.unitsSold - a.unitsSold
            )
            .map((product) => ({
                name: product.name,
                unitsSold: product.unitsSold,
                percentage:
                    totalUnitsSold > 0
                        ? Number(
                            (
                                (
                                    product.unitsSold /
                                    totalUnitsSold
                                ) * 100
                            ).toFixed(2)
                        )
                        : 0
            }));

    const grouped = Array.from(
        groupedSales.values()
    ).map((period) => ({
        period: period.period,
        totalSales: period.totalSales,
        totalRevenue:
            Number(
                period.totalRevenue.toFixed(2)
            )
    }));

    const report = {
        totalSales: sales.length,
        totalRevenue:
            Number(totalRevenue.toFixed(2)),
        topProducts,
        grouped
    };

    if (shouldUseCache) {

        reportCache.set(
            cacheKey,
            {
                createdAt: Date.now(),
                data: report
            }
        );

    }

    return report;
};

module.exports = {
    getSalesReport
};
import {
    Area,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

import "./PredictionChart.css";

function PredictionChart({
    history = [],
    forecast = []
}) {

    const chartData = [
        ...history.map((item) => ({
            date: item.date,
            history: Number(item.quantity),
            forecast: null,
            lowerBound: null,
            upperBound: null
        })),

        ...forecast.map((item) => ({
            date: item.date,
            history: null,
            forecast:
                item.predictedQuantity !== null
                    ? Number(item.predictedQuantity)
                    : null,
            lowerBound:
                item.lowerBound !== null
                    ? Number(item.lowerBound)
                    : null,
            upperBound:
                item.upperBound !== null
                    ? Number(item.upperBound)
                    : null
        }))
    ];

    const formatDate = (value) => {

        return new Date(
            `${value}T00:00:00`
        ).toLocaleDateString(
            "es-CO",
            {
                day: "numeric",
                month: "short"
            }
        );

    };

    const formatTooltipDate = (value) => {

        return new Date(
            `${value}T00:00:00`
        ).toLocaleDateString(
            "es-CO",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    };

    const hasConfidence =
        forecast.some(
            (item) =>
                item.lowerBound !== null &&
                item.upperBound !== null
        );

    const tooltipFormatter = (
        value,
        name
    ) => {

        const labels = {
            history: "Venta real",
            forecast: "Predicción",
            lowerBound: "Límite inferior",
            upperBound: "Límite superior"
        };

        return [
            value,
            labels[name] || name
        ];

    };

    return (

        <div className="prediction-chart">

            <div className="prediction-chart-wrapper">

                <ResponsiveContainer
                    width="100%"
                    height={280}
                >

                    <LineChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 15,
                            left: 0,
                            bottom: 10
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />

                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tick={{ fontSize: 11 }}
                            minTickGap={25}
                        />

                        <YAxis
                            allowDecimals={false}
                            tick={{ fontSize: 11 }}
                            width={35}
                        />

                        <Tooltip
                            labelFormatter={formatTooltipDate}
                            formatter={tooltipFormatter}
                        />

                        <Legend />

                        {hasConfidence && (

                            <Area
                                type="monotone"
                                dataKey="upperBound"
                                stroke="none"
                                fill="#2E7D32"
                                fillOpacity={0.08}
                                legendType="none"
                            />

                        )}

                        {hasConfidence && (

                            <Area
                                type="monotone"
                                dataKey="lowerBound"
                                stroke="none"
                                fill="#ffffff"
                                fillOpacity={1}
                                legendType="none"
                            />

                        )}

                        <Line
                            type="monotone"
                            dataKey="history"
                            name="Historial"
                            stroke="#6B7280"
                            strokeWidth={2.5}
                            dot={{ r: 3 }}
                            connectNulls={false}
                        />

                        <Line
                            type="monotone"
                            dataKey="forecast"
                            name="Predicción"
                            stroke="#2E7D32"
                            strokeWidth={2.5}
                            strokeDasharray="6 5"
                            dot={{ r: 3 }}
                            connectNulls={false}
                        />

                    </LineChart>

                </ResponsiveContainer>

            </div>

            <div className="prediction-chart-note">

                <span>
                    <i className="prediction-chart-history-dot" />
                    Historial real
                </span>

                <span>
                    <i className="prediction-chart-forecast-dot" />
                    Próximos 7 días
                </span>

                {hasConfidence && (
                    <span>
                        Intervalo de confianza
                    </span>
                )}

            </div>

        </div>

    );

}

export default PredictionChart;
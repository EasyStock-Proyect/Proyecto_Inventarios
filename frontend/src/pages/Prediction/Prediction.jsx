import { useEffect, useMemo, useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    Info,
    PackageOpen,
    RefreshCw
} from "lucide-react";

import { getPredictions } from "../../services/prediction.service";

import "./Prediction.css";

function Prediction() {

    const [predictions, setPredictions] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPredictions = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getPredictions();

            setPredictions(
                Array.isArray(response)
                    ? response
                    : []
            );

        } catch (error) {

            console.error(
                "Error cargando predicciones:",
                error
            );

            setError(
                error.response?.data?.message ||
                "No fue posible cargar las predicciones."
            );

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadPredictions();

    }, []);

    const processedPredictions = useMemo(() => {

        return predictions
            .map((prediction) => {

                const stock =
                    Number(prediction.currentStock ?? 0);

                const demand =
                    Number(prediction.forecast7d ?? 0);

                const recommendedOrder =
                    Number(
                        prediction.recommendedOrder ?? 0
                    );

                const needsReplenishment =
                    stock < demand;

                return {
                    ...prediction,
                    currentStock: stock,
                    forecast7d: demand,
                    recommendedOrder,
                    needsReplenishment
                };

            })
            .sort((a, b) => {

                if (
                    a.needsReplenishment !==
                    b.needsReplenishment
                ) {

                    return a.needsReplenishment
                        ? -1
                        : 1;

                }

                return a.productName.localeCompare(
                    b.productName,
                    "es",
                    {
                        sensitivity: "base"
                    }
                );

            });

    }, [predictions]);

    const summary = useMemo(() => {

        const replenishment =
            processedPredictions.filter(
                (product) =>
                    product.needsReplenishment
            ).length;

        const ok =
            processedPredictions.filter(
                (product) =>
                    !product.needsReplenishment
            ).length;

        return {
            total: processedPredictions.length,
            replenishment,
            ok
        };

    }, [processedPredictions]);

    const formatQuantity = (value) => {

        return Number(value ?? 0).toLocaleString(
            "es-CO"
        );

    };

    const getConfidenceLabel = (hasEnoughData) => {

        return hasEnoughData
            ? "Confiable"
            : "Baja confianza";

    };

    if (loading) {

        return (

            <div className="prediction-page">

                <div className="prediction-state">

                    <RefreshCw
                        size={20}
                        className="prediction-loading-icon"
                    />

                    <span>
                        Cargando predicciones...
                    </span>

                </div>

            </div>

        );

    }

    return (

        <div className="prediction-page">

            <header className="prediction-header">

                <div>

                    <h1>
                        Predicción de demanda
                    </h1>

                    <p>
                        Consulta la demanda estimada de tus productos
                        para los próximos 7 días.
                    </p>

                </div>

                <button
                    type="button"
                    className="prediction-refresh-button"
                    onClick={loadPredictions}
                    title="Actualizar predicciones"
                >

                    <RefreshCw size={17} />

                    Actualizar

                </button>

            </header>

            {error && (

                <div className="prediction-error">

                    <AlertTriangle size={17} />

                    <span>
                        {error}
                    </span>

                </div>

            )}

            {!error && (

                <>

                    <section className="prediction-summary">

                        <div className="prediction-summary-card">

                            <div className="prediction-summary-icon">
                                <PackageOpen size={19} />
                            </div>

                            <div>

                                <span>
                                    Productos
                                </span>

                                <strong>
                                    {summary.total}
                                </strong>

                            </div>

                        </div>

                        <div className="prediction-summary-card prediction-summary-replenishment">

                            <div className="prediction-summary-icon">
                                <AlertTriangle size={19} />
                            </div>

                            <div>

                                <span>
                                    Reabastecer
                                </span>

                                <strong>
                                    {summary.replenishment}
                                </strong>

                            </div>

                        </div>

                        <div className="prediction-summary-card prediction-summary-ok">

                            <div className="prediction-summary-icon">
                                <CheckCircle2 size={19} />
                            </div>

                            <div>

                                <span>
                                    OK
                                </span>

                                <strong>
                                    {summary.ok}
                                </strong>

                            </div>

                        </div>

                    </section>

                    <section className="prediction-content">

                        <div className="prediction-table-card">

                            <div className="prediction-table-header">

                                <div>

                                    <h2>
                                        Reabastecimiento
                                    </h2>

                                    <p>
                                        Productos ordenados por prioridad.
                                    </p>

                                </div>

                                <Info
                                    size={18}
                                    className="prediction-info-icon"
                                    title="La predicción es generada para los próximos 7 días. Se considera confiable desde 30 días de historial."
                                />

                            </div>

                            <div className="prediction-table-wrapper">

                                <table className="prediction-table">

                                    <thead>

                                        <tr>

                                            <th>
                                                Producto
                                            </th>

                                            <th>
                                                Stock actual
                                            </th>

                                            <th>
                                                Demanda 7 días
                                            </th>

                                            <th>
                                                Pedido recomendado
                                            </th>

                                            <th>
                                                Estado
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {processedPredictions.length === 0 ? (

                                            <tr>

                                                <td
                                                    colSpan="5"
                                                    className="prediction-empty"
                                                >
                                                    No hay predicciones disponibles.
                                                </td>

                                            </tr>

                                        ) : (

                                            processedPredictions.map(
                                                (prediction) => (

                                                    <tr
                                                        key={prediction.productId}
                                                        className={
                                                            selectedProduct?.productId ===
                                                            prediction.productId
                                                                ? "prediction-row selected"
                                                                : "prediction-row"
                                                        }
                                                        onClick={() =>
                                                            setSelectedProduct(
                                                                prediction
                                                            )
                                                        }
                                                    >

                                                        <td className="prediction-product-name">
                                                            {prediction.productName}
                                                        </td>

                                                        <td>
                                                            {formatQuantity(
                                                                prediction.currentStock
                                                            )}
                                                        </td>

                                                        <td>

                                                            <div className="prediction-demand-cell">

                                                                <strong>
                                                                    {formatQuantity(
                                                                        prediction.forecast7d
                                                                    )}
                                                                </strong>

                                                                {!prediction.hasEnoughData && (

                                                                    <span
                                                                        className="prediction-confidence"
                                                                        title="La predicción se basa en menos de 30 días de historial."
                                                                    >
                                                                        <Info size={14} />
                                                                    </span>

                                                                )}

                                                            </div>

                                                        </td>

                                                        <td>

                                                            <strong className="prediction-order-quantity">

                                                                {formatQuantity(
                                                                    prediction.recommendedOrder
                                                                )}

                                                            </strong>

                                                        </td>

                                                        <td>

                                                            {prediction.needsReplenishment ? (

                                                                <span className="prediction-status prediction-status-replenishment">

                                                                    <AlertTriangle
                                                                        size={14}
                                                                    />

                                                                    Reabastecer

                                                                </span>

                                                            ) : (

                                                                <span className="prediction-status prediction-status-ok">

                                                                    <CheckCircle2
                                                                        size={14}
                                                                    />

                                                                    OK

                                                                </span>

                                                            )}

                                                        </td>

                                                    </tr>

                                                )
                                            )

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                        {selectedProduct && (

                            <aside className="prediction-detail">

                                <div className="prediction-detail-header">

                                    <div>

                                        <span>
                                            Producto
                                        </span>

                                        <h2>
                                            {selectedProduct.productName}
                                        </h2>

                                    </div>

                                    <button
                                        type="button"
                                        className="prediction-detail-close"
                                        onClick={() =>
                                            setSelectedProduct(null)
                                        }
                                        title="Cerrar detalle"
                                    >
                                        ×
                                    </button>

                                </div>

                                <div className="prediction-detail-stats">

                                    <div className="prediction-detail-stat">

                                        <span>
                                            Stock actual
                                        </span>

                                        <strong>
                                            {formatQuantity(
                                                selectedProduct.currentStock
                                            )}
                                        </strong>

                                    </div>

                                    <div className="prediction-detail-stat">

                                        <span>
                                            Demanda próxima semana
                                        </span>

                                        <strong>
                                            {formatQuantity(
                                                selectedProduct.forecast7d
                                            )}
                                        </strong>

                                    </div>

                                    <div className="prediction-detail-stat">

                                        <span>
                                            Pedido recomendado
                                        </span>

                                        <strong>
                                            {formatQuantity(
                                                selectedProduct.recommendedOrder
                                            )}
                                        </strong>

                                    </div>

                                </div>

                                <div className="prediction-detail-confidence">

                                    {selectedProduct.hasEnoughData ? (

                                        <>

                                            <CheckCircle2 size={17} />

                                            <div>

                                                <strong>
                                                    Predicción confiable
                                                </strong>

                                                <p>
                                                    Basada en al menos 30 días
                                                    de historial.
                                                </p>

                                            </div>

                                        </>

                                    ) : (

                                        <>

                                            <Info size={17} />

                                            <div>

                                                <strong>
                                                    Baja confianza
                                                </strong>

                                                <p>
                                                    La predicción está disponible,
                                                    pero todavía no hay 30 días
                                                    de historial.
                                                </p>

                                            </div>

                                        </>

                                    )}

                                </div>

                                <div className="prediction-detail-action">

                                    {selectedProduct.needsReplenishment ? (

                                        <>

                                            <strong>
                                                Se recomienda reabastecer
                                            </strong>

                                            <p>
                                                El stock actual es inferior
                                                a la demanda estimada para
                                                los próximos 7 días.
                                            </p>

                                        </>

                                    ) : (

                                        <>

                                            <strong>
                                                Stock suficiente
                                            </strong>

                                            <p>
                                                El stock actual cubre la
                                                demanda estimada para la
                                                próxima semana.
                                            </p>

                                        </>

                                    )}

                                </div>

                            </aside>

                        )}

                    </section>

                </>

            )}

        </div>

    );

}

export default Prediction;
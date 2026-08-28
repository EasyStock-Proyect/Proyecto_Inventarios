import { useEffect, useState } from "react";

import {
    AlertTriangle,
    CheckCircle2,
    Info,
    X
} from "lucide-react";

import {
    getPredictionDetail
} from "../../services/prediction.service";

import PredictionChart from "../PredictionChart/PredictionChart";

import "./PredictionDetailModal.css";

function PredictionDetailModal({
    product,
    open,
    onClose
}) {

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!open || !product) {
            return;
        }

        const loadDetail = async () => {

            try {

                setLoading(true);
                setError("");
                setDetail(null);

                const response =
                    await getPredictionDetail(
                        product.productId
                    );

                setDetail(response);

            } catch (error) {

                console.error(
                    "Error cargando detalle de predicción:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    "No fue posible cargar el detalle de esta predicción."
                );

            } finally {

                setLoading(false);

            }

        };

        loadDetail();

    }, [open, product]);

    useEffect(() => {

        if (!open) {
            return;
        }

        const handleEscape = (event) => {

            if (event.key === "Escape") {
                onClose();
            }

        };

        document.addEventListener(
            "keydown",
            handleEscape
        );

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {

            document.removeEventListener(
                "keydown",
                handleEscape
            );

            document.body.style.overflow =
                previousOverflow;

        };

    }, [open, onClose]);

    if (!open || !product) {
        return null;
    }

    const formatQuantity = (value) => {

        return Number(value ?? 0)
            .toLocaleString("es-CO");

    };

    const handleOverlayMouseDown = (event) => {

        if (
            event.target === event.currentTarget
        ) {
            onClose();
        }

    };

    return (

        <div
            className="prediction-modal-overlay"
            onMouseDown={handleOverlayMouseDown}
        >

            <div
                className="prediction-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="prediction-modal-title"
            >

                <div className="prediction-modal-header">

                    <div className="prediction-modal-title-container">

                        <span>
                            Detalle de predicción
                        </span>

                        <h2 id="prediction-modal-title">
                            {product.productName}
                        </h2>

                    </div>

                    <button
                        type="button"
                        className="prediction-modal-close"
                        onClick={onClose}
                        aria-label="Cerrar detalle"
                    >
                        <X size={19} />
                    </button>

                </div>

                {loading && (

                    <div className="prediction-modal-state">

                        Cargando detalle de predicción...

                    </div>

                )}

                {!loading && error && (

                    <div className="prediction-modal-error">

                        <AlertTriangle size={18} />

                        <span>
                            {error}
                        </span>

                    </div>

                )}

                {!loading && !error && detail && (

                    <div className="prediction-modal-body">

                        <div className="prediction-modal-summary">

                            <div className="prediction-modal-main-stat">

                                <span>
                                    Pedido recomendado
                                </span>

                                <strong>
                                    {formatQuantity(
                                        detail.recommendedOrder
                                    )}

                                    <small>
                                        {" "}unidades
                                    </small>
                                </strong>

                            </div>

                            <div className="prediction-modal-stat">

                                <span>
                                    Demanda 7 días
                                </span>

                                <strong>
                                    {formatQuantity(
                                        detail.forecast7d
                                    )}
                                </strong>

                            </div>

                            <div className="prediction-modal-stat">

                                <span>
                                    Stock actual
                                </span>

                                <strong>
                                    {formatQuantity(
                                        detail.currentStock
                                    )}
                                </strong>

                            </div>

                        </div>

                        <div
                            className={
                                detail.hasEnoughData
                                    ? "prediction-modal-confidence prediction-modal-confidence-good"
                                    : "prediction-modal-confidence prediction-modal-confidence-warning"
                            }
                        >

                            {detail.hasEnoughData ? (
                                <CheckCircle2 size={18} />
                            ) : (
                                <Info size={18} />
                            )}

                            <div>

                                <strong>
                                    {detail.hasEnoughData
                                        ? "Predicción confiable"
                                        : "Predicción con baja confianza"
                                    }
                                </strong>

                                <p>

                                    {detail.hasEnoughData
                                        ? `El modelo cuenta con ${detail.trainingDays} días de historial.`
                                        : `El modelo cuenta con ${detail.trainingDays} días de historial. La predicción está disponible, pero todavía no cumple los 30 días requeridos para considerarse confiable.`
                                    }

                                </p>

                            </div>

                        </div>

                        <div className="prediction-modal-confidence-range">

                            <div>

                                <span>
                                    Demanda mínima estimada
                                </span>

                                <strong>
                                    {formatQuantity(
                                        detail.confidence?.lowerBound
                                    )}
                                </strong>

                            </div>

                            <div>

                                <span>
                                    Demanda máxima estimada
                                </span>

                                <strong>
                                    {formatQuantity(
                                        detail.confidence?.upperBound
                                    )}
                                </strong>

                            </div>

                        </div>

                        <div className="prediction-modal-chart-section">

                            <div className="prediction-modal-section-title">

                                <div>

                                    <h3>
                                        Historial y pronóstico
                                    </h3>

                                    <p>
                                        Historial reciente y demanda estimada
                                        para los próximos 7 días.
                                    </p>

                                </div>

                            </div>

                            <PredictionChart
                                history={detail.history}
                                forecast={detail.forecast}
                            />

                        </div>

                    </div>

                )}

            </div>

        </div>

    );
}

export default PredictionDetailModal;
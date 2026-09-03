import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Info,
    PackageOpen,
    RefreshCw
} from "lucide-react";

import PredictionDetailModal
    from "../../components/PredictionDetailModal/PredictionDetailModal";

import {
    getPredictions
} from "../../services/prediction.service";

import "./Prediction.css";

const ITEMS_PER_PAGE = 10;

function Prediction() {

    const [
        predictions,
        setPredictions
    ] = useState([]);

    const [
        selectedProduct,
        setSelectedProduct
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");

    const [
        page,
        setPage
    ] = useState(1);

    const [
        showInfo,
        setShowInfo
    ] = useState(false);


    const loadPredictions = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await getPredictions();

            setPredictions(
                Array.isArray(response)
                    ? response
                    : []
            );

            setPage(1);

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

        const loadPredictionsOnMount =
            setTimeout(loadPredictions, 0);

        return () => {
            clearTimeout(loadPredictionsOnMount);
        };
    }, []);


    const processedPredictions = useMemo(() => {

        return predictions
            .map((prediction) => {

                const currentStock =
                    Number(
                        prediction.currentStock ?? 0
                    );

                const forecast7d =
                    Number(
                        prediction.forecast7d ?? 0
                    );

                const recommendedOrder =
                    Number(
                        prediction.recommendedOrder ?? 0
                    );

                return {
                    ...prediction,
                    currentStock,
                    forecast7d,
                    recommendedOrder,
                    needsReplenishment:
                        currentStock < forecast7d
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

                if (
                    a.needsReplenishment &&
                    b.needsReplenishment
                ) {

                    const deficitA =
                        a.forecast7d -
                        a.currentStock;

                    const deficitB =
                        b.forecast7d -
                        b.currentStock;

                    return deficitB - deficitA;

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
            processedPredictions.length -
            replenishment;

        return {
            total: processedPredictions.length,
            replenishment,
            ok
        };

    }, [processedPredictions]);


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                processedPredictions.length /
                ITEMS_PER_PAGE
            )
        );


    const currentPage =
        Math.min(
            page,
            totalPages
        );


    const visiblePredictions =
        processedPredictions.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );


    const formatQuantity = (value) => {

        return Number(value ?? 0)
            .toLocaleString("es-CO");

    };


    const handlePreviousPage = () => {

        setPage((currentPage) =>
            Math.max(
                1,
                currentPage - 1
            )
        );

    };


    const handleNextPage = () => {

        setPage((currentPage) =>
            Math.min(
                totalPages,
                currentPage + 1
            )
        );

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

                    <h1 className="page-title">
                        Predicción de demanda
                    </h1>

                    <p>
                        Demanda estimada y reabastecimiento
                        para los próximos 7 días.
                    </p>

                </div>


                <div className="prediction-header-actions">

                    <button
                        type="button"
                        className="prediction-info-button"
                        onClick={() =>
                            setShowInfo(
                                (current) => !current
                            )
                        }
                        title="Cómo funciona la predicción"
                        aria-expanded={showInfo}
                    >

                        <Info size={17} />

                        Información

                    </button>


                    <button
                        type="button"
                        className="prediction-refresh-button"
                        onClick={loadPredictions}
                        title="Actualizar predicciones"
                    >

                        <RefreshCw size={17} />

                        Actualizar

                    </button>

                </div>

            </header>


            {showInfo && (

                <section className="prediction-info-panel">

                    <div className="prediction-info-panel-icon">

                        <Info size={19} />

                    </div>


                    <div>

                        <h3>
                            ¿Cómo funciona la predicción?
                        </h3>


                        <p>
                            El sistema analiza el historial
                            de ventas de cada producto para
                            estimar cuántas unidades podrían
                            venderse durante los próximos
                            7 días.
                        </p>


                        <p>
                            La predicción puede generarse
                            desde el primer día de historial
                            disponible.
                        </p>


                        <p>
                            Cuando hay menos de
                            <strong> 30 días de historial </strong>
                            la predicción está disponible,
                            pero debe interpretarse con
                            cautela porque todavía no se
                            considera confiable.
                        </p>


                        <p>
                            A partir de
                            <strong> 30 días de historial </strong>
                            la predicción se considera
                            confiable.
                        </p>


                        <p>
                            Para entrenar el modelo se utilizan
                            como máximo los
                            <strong> últimos 60 días </strong>
                            disponibles.
                        </p>


                        <p>
                            El pedido recomendado considera
                            la demanda estimada y el stock
                            actual del producto.
                        </p>


                        <p className="prediction-info-note">
                            Recuerda: una predicción es una
                            estimación y no garantiza la cantidad
                            exacta de ventas futuras.
                        </p>

                    </div>

                </section>

            )}


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


                    <section className="prediction-table-card">

                        <div className="prediction-table-header">

                            <div>

                                <h2>
                                    Reabastecimiento
                                </h2>

                                <p>
                                    Productos ordenados por
                                    necesidad de reabastecimiento.
                                </p>

                            </div>


                            <span className="prediction-total-label">

                                {processedPredictions.length} productos

                            </span>

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

                                    {visiblePredictions.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="prediction-empty"
                                            >
                                                No hay predicciones disponibles.
                                            </td>

                                        </tr>

                                    ) : (

                                        visiblePredictions.map(
                                            (prediction) => (

                                                <tr
                                                    key={
                                                        prediction.productId
                                                    }
                                                    className="prediction-row"
                                                    onClick={() =>
                                                        setSelectedProduct(
                                                            prediction
                                                        )
                                                    }
                                                    tabIndex="0"
                                                    onKeyDown={(
                                                        event
                                                    ) => {

                                                        if (
                                                            event.key ===
                                                                "Enter" ||
                                                            event.key ===
                                                                " "
                                                        ) {

                                                            event.preventDefault();

                                                            setSelectedProduct(
                                                                prediction
                                                            );

                                                        }

                                                    }}
                                                >

                                                    <td className="prediction-product-name">

                                                        {
                                                            prediction.productName
                                                        }

                                                    </td>


                                                    <td>

                                                        {
                                                            formatQuantity(
                                                                prediction.currentStock
                                                            )
                                                        }

                                                    </td>


                                                    <td>

                                                        <div className="prediction-demand-cell">

                                                            <strong>
                                                                {
                                                                    formatQuantity(
                                                                        prediction.forecast7d
                                                                    )
                                                                }
                                                            </strong>


                                                            {!prediction.hasEnoughData && (

                                                                <span
                                                                    className="prediction-confidence"
                                                                    title="Esta predicción todavía no es confiable porque tiene menos de 30 días de historial."
                                                                >

                                                                    <Info
                                                                        size={14}
                                                                    />

                                                                </span>

                                                            )}

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <strong className="prediction-order-quantity">

                                                            {
                                                                formatQuantity(
                                                                    prediction.recommendedOrder
                                                                )
                                                            }

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


                        <div className="prediction-pagination">

                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={
                                    handlePreviousPage
                                }
                                title="Página anterior"
                            >

                                <ChevronLeft size={16} />

                                Anterior

                            </button>


                            <span>

                                Página {currentPage} de {totalPages}

                            </span>


                            <button
                                type="button"
                                disabled={
                                    currentPage >= totalPages
                                }
                                onClick={
                                    handleNextPage
                                }
                                title="Página siguiente"
                            >

                                Siguiente

                                <ChevronRight size={16} />

                            </button>

                        </div>

                    </section>


                    <PredictionDetailModal
                        product={selectedProduct}
                        open={
                            Boolean(
                                selectedProduct
                            )
                        }
                        onClose={() =>
                            setSelectedProduct(null)
                        }
                    />

                </>

            )}

        </div>

    );

}

export default Prediction;
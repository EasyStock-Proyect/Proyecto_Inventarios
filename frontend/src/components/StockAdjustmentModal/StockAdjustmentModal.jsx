import { useRef, useState } from "react";

import { adjustStock } from "../../services/product.service";

import "./StockAdjustmentModal.css";

import {
    PackagePlus,
    Undo2,
    TriangleAlert,
    ClipboardPen,
    ArrowUp,
    ArrowDown,
    X
} from "lucide-react";

function StockAdjustmentModal({
    open,
    product,
    onClose,
    onSuccess
}) {

    const mouseDownInside = useRef(false);

    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("ENTRY");
    const [direction, setDirection] = useState("INCREASE");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!open || !product) {
        return null;
    }

    const buttonLabel = {

        ENTRY: "Registrar entrada",

        DEVOLUTION: "Registrar devolución",

        LOSS: "Registrar pérdida",

        CORRECTION: "Guardar corrección"

    };

    const handleSubmit = async () => {

        if (!quantity || Number(quantity) <= 0) {

            setError("Ingrese una cantidad válida.");

            return;

        }

        const body = {
            quantity: Number(quantity),
            reason,
            notes
        };

        if (reason === "CORRECTION") {
            body.direction = direction;
        }

        try {

            setLoading(true);

            setError("");

            const movement = await adjustStock(
                product.id,
                body
            );

            onSuccess(movement);

            onClose();

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "No fue posible ajustar las existencias."
            );

        } finally {

            setLoading(false);

        }

    };

    const handleReasonChange = (newReason) => {

        setReason(newReason);

        if (
            newReason === "ENTRY" ||
            newReason === "DEVOLUTION"
        ) {
            setDirection("INCREASE");
        }

        if (newReason === "LOSS") {
            setDirection("DECREASE");
        }

    };

    const handleQuantityChange = (event) => {

        const value = event.target.value;

        if (
            value === "" ||
            /^[0-9]+$/.test(value)
        ) {

            setQuantity(value);
            setError("");

        }

    };

    return (

        <div
            className="stock-adjustment-overlay"
            onMouseDown={(event) => {
                mouseDownInside.current =
                    event.target.closest(".stock-adjustment-modal") !== null;
            }}
            onClick={(event) => {
                if (
                    event.target === event.currentTarget &&
                    !mouseDownInside.current
                ) {
                    onClose();
                }

                mouseDownInside.current = false;
            }}
        >

            <div
                className="stock-adjustment-modal"
                onClick={(event) => event.stopPropagation()}
            >

                <button
                    type="button"
                    className="modal-close-button"
                    onClick={onClose}
                    title="Cerrar"
                >
                    <X size={22} />
                </button>

                <h2>Ajustar existencias</h2>

                <p className="product-card-name">
                    {product.name}
                </p>

                <p className="product-stock">
                    Existencias actuales: {product.stockCurrent} unidades
                </p>

                <div className="form-group">

                    <label>Cantidad de unidades</label>

                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                    />

                    {error && (
                        <small className="input-error">
                            {error}
                        </small>
                    )}

                </div>

                <div className="form-group">

                    <label>Motivo</label>

                    <div className="reason-chips">

                        <button
                            type="button"
                            className={
                                reason === "ENTRY"
                                    ? "chip active"
                                    : "chip"
                            }
                            onClick={() =>
                                handleReasonChange("ENTRY")
                            }
                        >
                            <PackagePlus size={16} />
                            Compra
                        </button>

                        <button
                            type="button"
                            className={
                                reason === "DEVOLUTION"
                                    ? "chip active"
                                    : "chip"
                            }
                            onClick={() =>
                                handleReasonChange("DEVOLUTION")
                            }
                        >
                            <Undo2 size={16} />
                            Devolución
                        </button>

                        <button
                            type="button"
                            className={
                                reason === "LOSS"
                                    ? "chip active"
                                    : "chip"
                            }
                            onClick={() =>
                                handleReasonChange("LOSS")
                            }
                        >
                            <TriangleAlert size={16} />
                            Pérdida
                        </button>

                        <button
                            type="button"
                            className={
                                reason === "CORRECTION"
                                    ? "chip active"
                                    : "chip"
                            }
                            onClick={() =>
                                handleReasonChange("CORRECTION")
                            }
                        >
                            <ClipboardPen size={16} />
                            Corrección
                        </button>

                    </div>

                    <p
                        className={`adjustment-help
                            ${reason === "ENTRY" ? "entry" : ""}
                            ${reason === "DEVOLUTION" ? "devolution" : ""}
                            ${reason === "LOSS" ? "loss" : ""}
                            ${reason === "CORRECTION" ? "correction" : ""}
                        `}
                    >

                        {reason === "ENTRY" &&
                            "Se agregarán unidades al inventario."}

                        {reason === "DEVOLUTION" &&
                            "Se agregarán unidades devueltas por un cliente."}

                        {reason === "LOSS" &&
                            "Se descontarán unidades del inventario."}

                        {reason === "CORRECTION" &&
                            "Seleccione si desea aumentar o disminuir manualmente el inventario."}

                    </p>

                </div>

                {reason === "CORRECTION" && (

                    <div className="form-group">

                        <label>Tipo de corrección</label>

                        <div className="direction-chips">

                            <button
                                type="button"
                                className={
                                    direction === "INCREASE"
                                        ? "chip active"
                                        : "chip"
                                }
                                onClick={() =>
                                    setDirection("INCREASE")
                                }
                            >
                                <ArrowUp size={16} />
                                Aumentar
                            </button>

                            <button
                                type="button"
                                className={
                                    direction === "DECREASE"
                                        ? "chip active"
                                        : "chip"
                                }
                                onClick={() =>
                                    setDirection("DECREASE")
                                }
                            >
                                <ArrowDown size={16} />
                                Disminuir
                            </button>

                        </div>

                    </div>

                )}

                <div className="form-group">

                    <label>Observaciones (opcional)</label>

                    <textarea
                        rows={3}
                        value={notes}
                        onChange={(event) =>
                            setNotes(event.target.value)
                        }
                    />

                </div>

                <div className="modal-actions">

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleSubmit}
                    >

                        {loading
                            ? "Guardando..."
                            : buttonLabel[reason]}

                    </button>

                </div>

            </div>

        </div>

    );

}

export default StockAdjustmentModal;
import { useEffect, useState } from "react";

import { adjustStock } from "../../services/product.service";

import "./StockAdjustmentModal.css";

function StockAdjustmentModal({
    open,
    product,
    onClose,
    onSuccess
}) {

    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("ENTRY");
    const [direction, setDirection] = useState("INCREASE");
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        if (open) {

            setQuantity("");
            setReason("ENTRY");
            setDirection("INCREASE");
            setNotes("");
            setError("");

        }

    }, [open]);

    if (!open || !product) {
        return null;
    }

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

    }

    return (
        <div className="stock-adjustment-overlay">
            <div className="stock-adjustment-modal">
                <h2>Ajustar existencias</h2>

                <p className="product-name">{product.name}</p>

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
                        onChange={(event) => {

                            const value = event.target.value;

                            if (
                                value === "" ||
                                /^[0-9]+$/.test(value)
                            ) {

                                setQuantity(value);
                                setError("");

                            }

                        }}
                    />

                    {error && <small className="input-error">{error}</small>}
                </div>



                <div className="form-group">

                    <label>Motivo</label>

                    <select
                        value={reason}
                        onChange={(event) => {

                            setReason(event.target.value);

                            if (event.target.value !== "CORRECTION") {
                                setDirection("INCREASE");
                            }

                        }}
                    >

                        <option value="ENTRY">
                            Compra a proveedor
                        </option>

                        <option value="DEVOLUTION">
                            Devolución de cliente
                        </option>

                        <option value="LOSS">
                            Pérdida
                        </option>

                        <option value="CORRECTION">
                            Corrección de inventario
                        </option>

                    </select>

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

                        <select
                            value={direction}
                            onChange={(event) =>
                                setDirection(event.target.value)
                            }
                        >

                            <option value="INCREASE">
                                Aumentar existencias
                            </option>

                            <option value="DECREASE">
                                Disminuir existencias
                            </option>

                        </select>

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

                    <button type="button" onClick={onClose}>
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
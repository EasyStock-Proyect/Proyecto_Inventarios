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
    const [notes, setNotes] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        if (open) {

            setQuantity("");
            setReason("ENTRY");
            setNotes("");
            setError("");

        }

    }, [open]);

    if (!open || !product) {
        return null;
    }

    return (
        <div className="stock-adjustment-overlay">
            <div className="stock-adjustment-modal">
                <h2>Añadir existencias</h2>

                <p className="product-name">{product.name}</p>

                <div className="form-group">
                    <label>Cantidad a añadir</label>

                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(event) => {
                            setQuantity(event.target.value);
                            setError("");
                        }}
                    />

                    {error && <small className="input-error">{error}</small>}
                </div>

                <div className="form-group">
                    <label>Motivo</label>

                    <select
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                    >
                        <option value="ENTRY">Compra a proveedor</option>

                        <option value="LOSS">Pérdida</option>

                        <option value="CORRECTION">Corrección de inventario</option>

                        <option value="OTHER">Otro</option>
                    </select>
                </div>

                {reason === "OTHER" && (
                    <div className="form-group">
                        <label>Observaciones</label>

                        <textarea
                            rows={3}
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                        />
                    </div>
                )}

                <div className="modal-actions">
                    <button type="button" onClick={onClose}>
                        Cancelar
                    </button>

                    <button type="button">Confirmar</button>
                </div>
            </div>
        </div>
    );

}

export default StockAdjustmentModal;
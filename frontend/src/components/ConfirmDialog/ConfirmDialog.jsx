import { AlertTriangle, X } from "lucide-react";

import "./ConfirmDialog.css";

function ConfirmDialog({
    open,
    title = "Confirmar acción",
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    loading = false
}) {

    if (!open) {
        return null;
    }

    return (

        <div
            className="confirm-dialog-overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget && !loading) {
                    onCancel();
                }

            }}
        >

            <div
                className="confirm-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
            >

                <button
                    type="button"
                    className="confirm-dialog-close"
                    onClick={onCancel}
                    disabled={loading}
                    title="Cerrar"
                >
                    <X size={19} />
                </button>

                <div className="confirm-dialog-icon">
                    <AlertTriangle size={22} />
                </div>

                <h2 id="confirm-dialog-title">
                    {title}
                </h2>

                <p>
                    {message}
                </p>

                <div className="confirm-dialog-actions">

                    <button
                        type="button"
                        className="confirm-dialog-cancel"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        className="confirm-dialog-confirm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading
                            ? "Eliminando..."
                            : confirmText}
                    </button>

                </div>

            </div>

        </div>

    );
}

export default ConfirmDialog;


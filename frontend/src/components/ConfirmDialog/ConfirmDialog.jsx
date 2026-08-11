import { AlertTriangle, CheckCircle2, CircleX, X } from "lucide-react";

import "./ConfirmDialog.css";

function ConfirmDialog({
    open,
    title = "Confirmar acción",
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    loading = false,
    type = "confirm"
}) {

    if (!open) {
        return null;
    }

    const resolvedType = ["success", "error", "warning", "confirm"].includes(type)
        ? type
        : "confirm";

    const typeConfig = {
        success: {
            icon: CheckCircle2,
            rootClass: "confirm-dialog-success"
        },
        error: {
            icon: CircleX,
            rootClass: "confirm-dialog-error"
        },
        warning: {
            icon: AlertTriangle,
            rootClass: "confirm-dialog-warning"
        },
        confirm: {
            icon: AlertTriangle,
            rootClass: "confirm-dialog-confirm"
        }
    };

    const selectedType = typeConfig[resolvedType];
    const Icon = selectedType.icon;

    return (

        <div
            className="confirm-dialog-overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget && !loading) {
                    onCancel?.();
                }

            }}
        >

            <div
                className={`confirm-dialog ${selectedType.rootClass}`}
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
                    <Icon size={22} />
                </div>

                <h2 id="confirm-dialog-title">
                    {title}
                </h2>

                <p>
                    {message}
                </p>

                <div className="confirm-dialog-actions">

                    {cancelText && (
                        <button
                            type="button"
                            className="confirm-dialog-cancel"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            {cancelText}
                        </button>
                    )}

                    <button
                        type="button"
                        className="confirm-dialog-action-confirm"
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


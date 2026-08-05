import {
    FiAlertCircle,
    FiCheck,
    FiX
} from "react-icons/fi";

import "./NotificationPanel.css";

function NotificationPanel({
    alerts,
    onClose,
    onMarkAsRead,
    onMarkAllAsRead,
    loading
}) {

    return (
        <>
            <div
                className="notification-overlay"
                onClick={onClose}
            />

            <aside className="notification-panel">

                <div className="notification-panel-header">

                    <div>
                        <h2>Alertas de stock</h2>

                        <span>
                            {alerts.length} alerta
                            {alerts.length !== 1 ? "s" : ""} activas
                        </span>
                    </div>

                    <button
                        type="button"
                        className="notification-panel-close"
                        onClick={onClose}
                        aria-label="Cerrar notificaciones"
                    >
                        <FiX />
                    </button>

                </div>


                <div className="notification-panel-list">

                    {alerts.length === 0 ? (

                        <div className="notification-panel-empty">

                            <FiCheck />

                            <p>
                                No tienes alertas pendientes.
                            </p>

                        </div>

                    ) : (

                        alerts.map((alert) => {

                            const product = alert.product;

                            const currentStock =
                                product?.stockCurrent ?? 0;

                            const minimumStock =
                                product?.stockMinimum ?? 0;

                            const percentage =
                                minimumStock > 0
                                    ? Math.min(
                                        (currentStock / minimumStock) * 100,
                                        100
                                    )
                                    : 0;

                            return (

                                <div
                                    className="notification-stock-item"
                                    key={alert.id}
                                >

                                    <div className="notification-stock-icon">
                                        <FiAlertCircle />
                                    </div>


                                    <div className="notification-stock-content">

                                        <strong>
                                            {product?.name || "Producto"}
                                        </strong>

                                        <span className="notification-stock-category">
                                            {product?.category?.name || "Sin categoría"}
                                        </span>


                                        <div className="notification-stock-progress">

                                            <div
                                                className="notification-stock-progress-bar"
                                                style={{
                                                    width: `${percentage}%`
                                                }}
                                            />

                                        </div>


                                        <span className="notification-stock-value">
                                            {currentStock}/{minimumStock}
                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        className="notification-mark-read"
                                        disabled={loading}
                                        onClick={() =>
                                            onMarkAsRead(alert.id)
                                        }
                                    >
                                        Marcar
                                        <br />
                                        leída
                                    </button>

                                </div>

                            );

                        })

                    )}

                </div>


                {alerts.length > 0 && (

                    <div className="notification-panel-footer">

                        <button
                            type="button"
                            className="notification-mark-all"
                            disabled={loading}
                            onClick={onMarkAllAsRead}
                        >
                            Marcar todas como leídas
                        </button>

                    </div>

                )}

            </aside>
        </>
    );
}

export default NotificationPanel;
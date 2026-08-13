import { useEffect, useState } from "react";
import { FiBell, FiMenu } from "react-icons/fi";
import { useLocation } from "react-router-dom";

import {
    getAlerts,
    markAlertAsRead
} from "../../services/alert.service";

import NotificationPanel from "../NotificationPanel/NotificationPanel";

import "./Topbar.css";

function Topbar({ user, setIsMenuOpen }) {

    const location = useLocation();

    const pageTitles = {
        "/dashboard": "Inicio",
        "/inventario": "Inventario",
        "/ventas": "Ventas",
        "/prediccion": "Predicción",
        "/ajustes": "Ajustes"
    };

    const currentPage =
        pageTitles[location.pathname] || "";

    const [alerts, setAlerts] = useState([]);

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [loading, setLoading] = useState(false);

    const loadAlerts = async () => {

        try {

            const response = await getAlerts();

            setAlerts(response);

        } catch (error) {

            console.error(
                "Error cargando alertas:",
                error
            );

        }

    };

    useEffect(() => {

        const timeout = setTimeout(() => {
            loadAlerts();
        }, 0);

        const handleSaleCreated = () => {
            loadAlerts();
        };

        window.addEventListener(
            "sale-created",
            handleSaleCreated
        );

        return () => {

            clearTimeout(timeout);

            window.removeEventListener(
                "sale-created",
                handleSaleCreated
            );

        };

    }, []);

    const handleMarkAsRead = async (alertId) => {

        try {

            setLoading(true);

            await markAlertAsRead(alertId);

            setAlerts((previousAlerts) =>
                previousAlerts.filter(
                    (alert) =>
                        alert.id !== alertId
                )
            );

        } catch (error) {

            console.error(
                "Error marcando alerta como leída:",
                error
            );

        } finally {

            setLoading(false);

        }

    };

    const handleMarkAllAsRead = async () => {

        try {

            setLoading(true);

            const alertsToRead = [...alerts];

            await Promise.all(
                alertsToRead.map((alert) =>
                    markAlertAsRead(alert.id)
                )
            );

            setAlerts([]);

        } catch (error) {

            console.error(
                "Error marcando todas las alertas:",
                error
            );

            await loadAlerts();

        } finally {

            setLoading(false);

        }

    };

    return (

        <>

            <header className="topbar">

                <div className="topbar-title">

                    <button
                        type="button"
                        className="topbar-menu-button"
                        onClick={() =>
                            setIsMenuOpen(true)
                        }
                        aria-label="Abrir menú"
                    >
                        <FiMenu />
                    </button>

                    <div className="topbar-title-text">

                        <span className="business-name">
                            {user?.businessName || "Mi tienda"}
                        </span>

                        <span className="page-name">
                            {currentPage}
                        </span>

                    </div>

                </div>

                <div className="topbar-actions">

                    <button
                        type="button"
                        className="notification-button"
                        onClick={() =>
                            setShowNotifications(true)
                        }
                        aria-label="Abrir notificaciones"
                    >

                        <FiBell />

                        {alerts.length > 0 && (

                            <span className="notification-badge">

                                {alerts.length > 99
                                    ? "99+"
                                    : alerts.length}

                            </span>

                        )}

                    </button>

                </div>

            </header>

            {showNotifications && (

                <NotificationPanel
                    alerts={alerts}
                    onClose={() =>
                        setShowNotifications(false)
                    }
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllAsRead={
                        handleMarkAllAsRead
                    }
                    loading={loading}
                />

            )}

        </>

    );

}

export default Topbar;
import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";

import {
    getAlerts,
    markAlertAsRead
} from "../../services/alert.service";

import NotificationPanel from "../NotificationPanel/NotificationPanel";

import "./Topbar.css";

function Topbar() {

    const [alerts, setAlerts] = useState([]);

    const [showNotifications, setShowNotifications] =
        useState(false);

    const [loading, setLoading] = useState(false);


    const cargarAlertas = async () => {

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

        cargarAlertas();

        const interval = setInterval(() => {

            cargarAlertas();

        }, 30000);

        return () => clearInterval(interval);

    }, []);


    const handleMarkAsRead = async (alertId) => {

        try {

            setLoading(true);

            await markAlertAsRead(alertId);

            setAlerts((previousAlerts) =>
                previousAlerts.filter(
                    (alert) => alert.id !== alertId
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

            await cargarAlertas();

        } finally {

            setLoading(false);

        }

    };


    return (

        <>

            <header className="topbar">

                <div className="topbar-title">
                    <span>
                        Tienda La Esperanza
                    </span>
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
                    onMarkAllAsRead={handleMarkAllAsRead}
                    loading={loading}
                />

            )}

        </>

    );

}

export default Topbar;
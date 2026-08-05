import api from "../api/api";

export const getAlerts = async () => {

    const response = await api.get("/alerts");

    return response.data;

};

export const markAlertAsRead = async (alertId) => {

    const response = await api.patch(
        `/alerts/${alertId}/read`
    );

    return response.data;

};
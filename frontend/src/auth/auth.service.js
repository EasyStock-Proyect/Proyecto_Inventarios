import api from "../api/api";

import {
    clearAccessToken,
    setAccessToken
} from "./tokenManager";

let refreshPromise = null;

export const refreshSession = async () => {

    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = api.post("/auth/refresh", {})
        .then((response) => {
            const accessToken = response.data.accessToken;

            setAccessToken(accessToken);

            return accessToken;
        })
        .finally(() => {
            refreshPromise = null;
        });

    return refreshPromise;
};

export const restoreSession = async () => {

    try {

        await refreshSession();

        return true;

    } catch {

        clearAccessToken();

        return false;

    }

};

export const logout = async () => {

    try {

        await api.post("/auth/logout", {});

    } catch (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );

    }
};
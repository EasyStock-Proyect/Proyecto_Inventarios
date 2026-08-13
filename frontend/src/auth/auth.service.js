import axios from "axios";

import {
    clearAccessToken,
    setAccessToken
} from "./tokenManager";

let refreshPromise = null;

export const refreshSession = async () => {

    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = axios.post(
        "http://localhost:3000/api/auth/refresh",
        {},
        {
            withCredentials: true
        }
    )
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

        await axios.post(
            "http://localhost:3000/api/auth/logout",
            {},
            {
                withCredentials: true
            }
        );

    } catch (error) {

        console.error(
            "Error cerrando sesión:",
            error
        );

    }
};
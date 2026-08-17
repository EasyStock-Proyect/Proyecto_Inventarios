import axios from "axios";

import {
    clearAccessToken,
    getAccessToken
} from "../auth/tokenManager";

import { refreshSession } from "../auth/auth.service";

const configuredApiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const normalizedApiBaseUrl = configuredApiUrl.endsWith("/api")
    ? configuredApiUrl
    : `${configuredApiUrl}/api`;

const api = axios.create({

    baseURL: normalizedApiBaseUrl || "/api",

    headers: {
        "Content-Type": "application/json"
    },

    withCredentials: true

});

api.interceptors.request.use((config) => {

    const token = getAccessToken();

    if (token) {

        config.headers.Authorization =
            `Bearer ${token}`;

    }

    return config;

});

api.interceptors.response.use(
    (response) => response,

    async (error) => {

        const originalRequest = error.config;

        if (
            error.response?.status !== 401 ||
            !originalRequest ||
            originalRequest._retry ||
            originalRequest.url?.includes("/auth/refresh")
        ) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {

            const newAccessToken = await refreshSession();

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);

        } catch (refreshError) {

            console.error(
                "Error renovando sesión:",
                refreshError
            );

            clearAccessToken();

            return Promise.reject(refreshError);

        }

    }
);

export default api;
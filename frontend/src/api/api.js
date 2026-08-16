import axios from "axios";

import {
    clearAccessToken,
    getAccessToken
} from "../auth/tokenManager";

import { refreshSession } from "../auth/auth.service";

const api = axios.create({

    baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`,

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
            originalRequest._retry
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

            window.location.href = "/login";

            return Promise.reject(refreshError);

        }

    }
);

export default api;
import axios from "axios";

import {
    getAccessToken,
    setAccessToken,
    clearAccessToken
} from "../auth/tokenManager";

const api = axios.create({

    baseURL: "http://localhost:3000/api",

    headers: {
        "Content-Type": "application/json"
    },

    withCredentials: true

});


let isRefreshing = false;
let refreshSubscribers = [];


const subscribeTokenRefresh = (callback) => {

    refreshSubscribers.push(callback);

};


const notifyTokenRefresh = (token) => {

    refreshSubscribers.forEach(
        (callback) => callback(token)
    );

    refreshSubscribers = [];

};


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

        if (isRefreshing) {

            return new Promise((resolve, reject) => {

                subscribeTokenRefresh((token) => {

                    if (!token) {
                        reject(error);
                        return;
                    }

                    originalRequest.headers.Authorization =
                        `Bearer ${token}`;

                    resolve(api(originalRequest));

                });

            });

        }

        isRefreshing = true;

        try {

            const response = await axios.post(
                "http://localhost:3000/api/auth/refresh",
                {},
                {
                    withCredentials: true
                }
            );

            const newAccessToken =
                response.data.accessToken;

            setAccessToken(newAccessToken);

            notifyTokenRefresh(newAccessToken);

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

        } finally {

            isRefreshing = false;

        }

    }
);

export default api;
import axios from "axios";

import { setAccessToken } from "./tokenManager";

export const restoreSession = async () => {

    try {

        const response = await axios.post(
            "http://localhost:3000/api/auth/refresh",
            {},
            {
                withCredentials: true
            }
        );

        setAccessToken(
            response.data.accessToken
        );

        return true;

    } catch {

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
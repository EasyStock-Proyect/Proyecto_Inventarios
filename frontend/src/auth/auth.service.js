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

    } catch (error) {

        return false;

    }

};
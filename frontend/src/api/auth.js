import api from "./api";

export async function login(data) {

    try {

        const response = await api.post("/auth/login", data);

        return response.data;

    } catch (error) {

        const message = error.response?.data?.message || error.message;

        throw new Error(message, { cause: error });

    }

}

export async function register(data) {

    try {

        const response = await api.post("/auth/register", data);

        return response.data;

    } catch (error) {

        const message = error.response?.data?.message || error.message;

        throw new Error(message, { cause: error });

    }

}

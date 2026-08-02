import api from "../api/api";

export const getProducts = async (params = {}) => {
    const response = await api.get("/products", {
        params
    });

    return response.data;
};
import api from "../api/api";

export const getProducts = async (params = {}) => {

    const response = await api.get("/products", {
        params
    });

    return response.data;
    
};

export const adjustStock = async (productId, data) => {

    const response = await api.post(
        `/products/${productId}/adjustments`,
        data
    );

    return response.data;

};
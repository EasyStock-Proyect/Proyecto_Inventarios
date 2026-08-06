import api from "../api/api";

export const getProducts = async (params = {}) => {

    const response = await api.get("/products", {
        params
    });

    return response.data;
    
};

export const createProduct = async (data) => {

    const response = await api.post(
        "/products",
        data
    );

    return response.data;

};


export const updateProduct = async (id, data) => {

    const response = await api.put(
        `/products/${id}`,
        data
    );

    return response.data;

};

export const adjustStock = async (productId, data) => {

    const response = await api.post(
        `/products/${productId}/adjustments`,
        data
    );

    return response.data;

};

export const generateSku = async (categoryId) => {

    const response = await api.get(
        "/products/generate-sku",
        {
            params: { categoryId }
        }
    );

    return response.data.sku;

};


import api from "../api/api";


export const createSale = async (data) => {

    const response = await api.post(
        "/sales",
        data
    );

    return response.data;
};


export const getSales = async (params = {}) => {

    const response = await api.get(
        "/sales", {
            params
        }
    );

    return response.data;
};
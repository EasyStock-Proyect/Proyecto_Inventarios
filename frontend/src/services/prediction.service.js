import api from "../api/api";

export const getPredictions = async () => {

    const response = await api.get(
        "/predictions"
    );

    return response.data;

};

export const getPredictionDetail = async (productId) => {

    const response = await api.get(
        `/predictions/${productId}/detail`
    );

    return response.data;

};
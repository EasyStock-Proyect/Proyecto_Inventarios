import api from "../api/api";

export const getCategories = async () => {
    const response = await api.get("/categories");

    return response.data;
};
import { api } from "./client";

export const listFavorites = () => api.get("/favorites").then((r) => r.data);
export const addFavorite = (restaurantId) => api.post(`/favorites/${restaurantId}`).then((r) => r.data);
export const removeFavorite = (restaurantId) => api.delete(`/favorites/${restaurantId}`).then((r) => r.data);

import { api } from "./client";

export const getRecommendations = () => api.get("/recommendations").then((r) => r.data);

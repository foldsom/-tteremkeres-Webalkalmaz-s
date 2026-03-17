import { api } from "./client";

export const listRecommendations = () => api.get("/recommendations").then((r) => r.data);

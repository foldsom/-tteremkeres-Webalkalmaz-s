import { api } from "./client";

export const login = (payload) => api.post("/auth/login", payload).then((r) => r.data);

export const register = (payload) => api.post("/auth/register", payload).then((r) => r.data);

export const me = () =>
  api.get("/me").then((r) => ({
    id: r?.data?.userId,
    userId: r?.data?.userId,
    username: r?.data?.username || "Profil",
    email: r?.data?.email || "",
  }));

export const logout = () => api.post("/auth/logout").then((r) => r.data);

import { api } from "./client";

export const login = (payload) => api.post("/auth/login", payload).then((r) => r.data);

export const register = (payload) => api.post("/auth/register", payload).then((r) => r.data);

export const me = () =>
  api.get("/me").then((r) => {
    const userId = r?.data?.userId;
    return {
      id: userId,
      userId,
      username: userId ? `Felhasználó #${userId.slice(0, 6)}` : "Profil",
    };
  });

export const logout = async () => ({ ok: true });

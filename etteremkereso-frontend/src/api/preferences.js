import { api } from "./client";

export const listPreferences = () => api.get("/preferences").then((r) => r.data);
export const getMyPreferences = () => api.get("/me/preferences").then((r) => r.data);
export const setMyPreferences = (preferenceIds) =>
  api.put("/me/preferences", { preferenceIds }).then((r) => r.data);

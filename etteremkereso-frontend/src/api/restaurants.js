import { api } from "./client";

export const listRestaurants = (params) =>
  api.get("/restaurants", { params }).then((r) => r.data);

export const listMapRestaurants = (params) => {
  const cleanParams = { ...params };
  delete cleanParams.client;
  delete cleanParams.queryKey;
  delete cleanParams.signal;
  delete cleanParams.meta;

  return api.get("/restaurants/map", { params: cleanParams }).then((r) => r.data);
};

export const getRestaurant = (id) =>
  api.get(`/restaurants/${id}`).then((r) => r.data);

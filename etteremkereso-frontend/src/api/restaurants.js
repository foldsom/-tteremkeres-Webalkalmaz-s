import { api } from "./client";

export const listRestaurants = (params) =>
  api.get("/restaurants", { params }).then((r) => r.data);

export const listMapRestaurants = (params) =>
  api.get("/restaurants/map", { params }).then((r) => r.data);

export const getRestaurant = (id) =>
  api.get(`/restaurants/${id}`).then((r) => r.data);

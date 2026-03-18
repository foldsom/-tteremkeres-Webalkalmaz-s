import { api } from "./client";

export const listImagesForRestaurant = (restaurantId) =>
  api.get(`/images/restaurant/${restaurantId}`).then((r) => r.data);

export const addImageToRestaurant = (restaurantId, payload) =>
  api.post(`/images/restaurant/${restaurantId}`, payload).then((r) => r.data);

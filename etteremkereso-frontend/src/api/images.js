import { api } from "./client";

export const listImagesForRestaurant = (restaurantId) =>
  api.get(`/images/restaurant/${restaurantId}`).then((r) => r.data);

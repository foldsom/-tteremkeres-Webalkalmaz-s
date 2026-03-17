import { api } from "./client";

export const getRestaurantImages = (restaurantId) =>
  api.get(`/images/restaurant/${restaurantId}`).then((r) => r.data);

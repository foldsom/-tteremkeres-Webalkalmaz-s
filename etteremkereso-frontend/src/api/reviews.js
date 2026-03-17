import { api } from "./client";

export const getRestaurantReviews = (restaurantId) =>
  api.get(`/reviews/restaurant/${restaurantId}`).then((r) => r.data);

export const upsertReview = (restaurantId, payload) =>
  api.post(`/reviews/${restaurantId}`, payload).then((r) => r.data);

export const deleteReview = (restaurantId) => api.delete(`/reviews/${restaurantId}`).then((r) => r.data);

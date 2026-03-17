import { api } from "./client";

export const listReviewsForRestaurant = (restaurantId) =>
  api.get(`/reviews/restaurant/${restaurantId}`).then((r) => r.data);

export const upsertReview = (restaurantId, rating, comment) =>
  api.post(`/reviews/${restaurantId}`, { rating, comment }).then((r) => r.data);

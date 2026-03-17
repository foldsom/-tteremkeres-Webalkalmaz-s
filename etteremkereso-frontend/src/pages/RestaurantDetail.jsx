import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRestaurant } from "../api/restaurants";
import { addFavorite, removeFavorite } from "../api/favorites";
import { deleteReview, getRestaurantReviews, upsertReview } from "../api/reviews";
import { getRestaurantImages } from "../api/images";
import { useAuth } from "../store/auth";

export default function RestaurantDetail() {
  const { id } = useParams();
  const rid = Number(id);
  const qc = useQueryClient();
  const { isAuthed } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const enabled = Number.isFinite(rid) && rid > 0;

  const { data, isLoading, error } = useQuery({
    queryKey: ["restaurant", rid],
    queryFn: () => getRestaurant(rid),
    enabled,
  });

  const {
    data: reviewData,
    isLoading: reviewLoading,
    error: reviewError,
  } = useQuery({
    queryKey: ["reviews", rid],
    queryFn: () => getRestaurantReviews(rid),
    enabled,
  });

  const {
    data: images,
    isLoading: imageLoading,
    error: imageError,
  } = useQuery({
    queryKey: ["images", rid],
    queryFn: () => getRestaurantImages(rid),
    enabled,
  });

  const favMutation = useMutation({
    mutationFn: (isFavorite) => (isFavorite ? removeFavorite(rid) : addFavorite(rid)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["restaurant", rid] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () => upsertReview(rid, { rating, comment }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", rid] });
      qc.invalidateQueries({ queryKey: ["restaurant", rid] });
      setComment("");
      setRating(5);
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: () => deleteReview(rid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", rid] });
      qc.invalidateQueries({ queryKey: ["restaurant", rid] });
    },
  });

  if (!enabled) {
    return (
      <div className="container">
        <p style={{ color: "#fda4af" }}>Hibás étterem azonosító.</p>
      </div>
    );
  }

  if (isLoading) return <div className="container"><p>Betöltés...</p></div>;
  if (error) return <div className="container"><p style={{ color: "crimson" }}>{error.message}</p></div>;
  if (!data) return <div className="container"><p>Nincs adat.</p></div>;

  const { restaurant } = data;

  return (
    <div className="container">
      <h1>{restaurant.name}</h1>
      <p className="p">{restaurant.description || "Leírás még nem elérhető."}</p>
      <p><strong>Cím:</strong> {restaurant.address}</p>
      <p><strong>Kategória:</strong> {restaurant.cuisine || "-"}</p>
      <p><strong>Átlag:</strong> {Number(data.averageRating || 0).toFixed(1)} / 5 ({data.reviewCount} értékelés)</p>

      {isAuthed && (
        <button className="btn" onClick={() => favMutation.mutate(data.isFavorite)}>
          {data.isFavorite ? "Eltávolítás a kedvencekből" : "Hozzáadás a kedvencekhez"}
        </button>
      )}

      <div style={{ height: 16 }} />
      <h2>Képek</h2>
      {imageLoading && <p className="p">Képek betöltése…</p>}
      {imageError && <p style={{ color: "#fda4af" }}>{imageError.message}</p>}
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {(images ?? []).map((img) => (
          <div key={img.id} className="card card-pad">
            <img src={img.url} alt={img.caption || restaurant.name} style={{ width: "100%", borderRadius: 10 }} />
            {img.caption && <p className="p">{img.caption}</p>}
          </div>
        ))}
      </div>
      {!imageLoading && (images ?? []).length === 0 && <p className="p">Ehhez az étteremhez még nincs kép.</p>}

      <div style={{ height: 16 }} />
      <h2>Értékelések</h2>
      {isAuthed && (
        <div className="card card-pad" style={{ marginBottom: 12 }}>
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "100px 1fr auto auto" }}>
            <input
              className="input"
              type="number"
              min="1"
              max="5"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            />
            <input
              className="input"
              placeholder="Vélemény"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn btn-primary" onClick={() => reviewMutation.mutate()}>
              Mentés
            </button>
            <button className="btn" onClick={() => deleteReviewMutation.mutate()}>
              Saját törlése
            </button>
          </div>
          {reviewMutation.error && <p style={{ color: "#fda4af" }}>{reviewMutation.error.message}</p>}
          {deleteReviewMutation.error && <p style={{ color: "#fda4af" }}>{deleteReviewMutation.error.message}</p>}
        </div>
      )}

      {reviewLoading && <p className="p">Értékelések betöltése…</p>}
      {reviewError && <p style={{ color: "#fda4af" }}>{reviewError.message}</p>}
      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {(reviewData?.reviews ?? []).map((r) => (
          <div key={r.id} className="card card-pad">
            <div style={{ fontWeight: 700 }}>⭐ {r.rating}/5</div>
            <p className="p">{r.comment || "(Nincs szöveges vélemény)"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

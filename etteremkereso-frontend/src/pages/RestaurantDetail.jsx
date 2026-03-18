import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRestaurant } from "../api/restaurants";
import { listReviewsForRestaurant, upsertReview } from "../api/reviews";
import { addImageToRestaurant, listImagesForRestaurant } from "../api/images";
import { addFavorite, removeFavorite } from "../api/favorites";
import { useAuth } from "../store/useAuth";

export default function RestaurantDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { isAuthed } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageForm, setImageForm] = useState({ url: "", caption: "" });

  const { data, isLoading, error } = useQuery({ queryKey: ["restaurant", id], queryFn: () => getRestaurant(id) });
  const {
    data: reviews,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery({ queryKey: ["reviews", id], queryFn: () => listReviewsForRestaurant(id) });
  const {
    data: images = [],
    isLoading: imagesLoading,
    error: imagesError,
  } = useQuery({
    queryKey: ["images", id],
    queryFn: () => listImagesForRestaurant(id),
  });

  const favMut = useMutation({
    mutationFn: async () => {
      if (data?.isFavorite) return removeFavorite(id);
      return addFavorite(id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["restaurant", id] });
      await qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const reviewMut = useMutation({
    mutationFn: () => upsertReview(id, rating, comment),
    onSuccess: async () => {
      setComment("");
      await qc.invalidateQueries({ queryKey: ["reviews", id] });
      await qc.invalidateQueries({ queryKey: ["restaurant", id] });
    },
  });

  const imageMut = useMutation({
    mutationFn: () => addImageToRestaurant(id, imageForm),
    onSuccess: async () => {
      setImageForm({ url: "", caption: "" });
      await qc.invalidateQueries({ queryKey: ["images", id] });
    },
  });

  if (isLoading) return <p className="container">Betöltés...</p>;
  if (error) return <p className="container" style={{ color: "crimson" }}>{error.message}</p>;
  if (!data?.restaurant) return <p className="container">Nincs adat.</p>;

  const r = data.restaurant;

  return (
    <div className="container">
      <h1>{r.name}</h1>
      <p className="p"><strong>Cím:</strong> {r.address}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        <span className="badge">Konyha: {r.cuisine}</span>
        <span className="badge">Átlag: {Number(data.averageRating || 0).toFixed(1)}</span>
        <span className="badge">Vélemények: {data.reviewCount || 0}</span>
      </div>

      {isAuthed && (
        <>
          <button className="btn" style={{ marginTop: 12 }} disabled={favMut.isPending} onClick={() => favMut.mutate()}>
            {favMut.isPending
              ? "Mentés…"
              : data.isFavorite
                ? "Eltávolítás a kedvencekből"
                : "Hozzáadás a kedvencekhez"}
          </button>
          {favMut.error && <p style={{ color: "crimson" }}>{favMut.error.message}</p>}
        </>
      )}

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <div className="card card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0 }}>Képek</h3>
            <span className="badge">{images.length} db</span>
          </div>

          {isAuthed && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                imageMut.mutate();
              }}
              style={{ display: "grid", gap: 10, marginBottom: 16 }}
            >
              <input
                className="input"
                type="url"
                placeholder="Kép URL"
                value={imageForm.url}
                onChange={(e) => setImageForm((prev) => ({ ...prev, url: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Felirat (opcionális)"
                value={imageForm.caption}
                onChange={(e) => setImageForm((prev) => ({ ...prev, caption: e.target.value }))}
              />
              <button className="btn btn-primary" type="submit" disabled={imageMut.isPending || !imageForm.url.trim()}>
                {imageMut.isPending ? "Feltöltés…" : "Kép hozzáadása"}
              </button>
              {imageMut.error && <p style={{ color: "crimson", margin: 0 }}>{imageMut.error.message}</p>}
            </form>
          )}

          {imagesLoading && <p className="p">Képek betöltése…</p>}
          {imagesError && <p style={{ color: "crimson" }}>{imagesError.message}</p>}
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}>
            {images.map((img) => (
              <figure key={img.id} style={{ margin: 0 }}>
                <img key={img.id} src={img.url} alt={img.caption || r.name} style={{ width: "100%", borderRadius: 10, aspectRatio: "4 / 3", objectFit: "cover" }} />
                {img.caption && <figcaption className="p" style={{ marginTop: 8 }}>{img.caption}</figcaption>}
              </figure>
            ))}
            {!imagesLoading && images.length === 0 && <p className="p">Nincs kép.</p>}
          </div>
        </div>

        <div className="card card-pad">
          <h3>Értékelések</h3>
          {isAuthed && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                reviewMut.mutate();
              }}
              style={{ display: "grid", gap: 10, marginBottom: 12 }}
            >
              <input className="input" type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
              <textarea className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Írd meg a véleményed" />
              <button className="btn btn-primary" type="submit" disabled={reviewMut.isPending}>
                {reviewMut.isPending ? "Mentés…" : "Mentés"}
              </button>
              {reviewMut.error && <p style={{ color: "crimson" }}>{reviewMut.error.message}</p>}
            </form>
          )}

          {reviewsLoading && <p className="p">Vélemények betöltése…</p>}
          {reviewsError && <p style={{ color: "crimson" }}>{reviewsError.message}</p>}

          <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
            {(reviews?.reviews ?? []).map((rv) => (
              <div key={rv.id} style={{ borderBottom: "1px solid rgba(255,255,255,.1)", paddingBottom: 8 }}>
                <strong>{rv.rating}/5</strong>
                <p className="p">{rv.comment || "(Nincs szöveges vélemény)"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

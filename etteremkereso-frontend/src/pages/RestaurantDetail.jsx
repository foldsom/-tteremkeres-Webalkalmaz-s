import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRestaurant } from "../api/restaurants";
import { listReviewsForRestaurant, upsertReview } from "../api/reviews";
import { listImagesForRestaurant } from "../api/images";
import { addFavorite, removeFavorite } from "../api/favorites";
import { useAuth } from "../store/useAuth";
import api from "../api/client"; // Győződj meg róla, hogy az axios kliensed be van importálva!

export default function RestaurantDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { isAuthed } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading, error } = useQuery({ queryKey: ["restaurant", id], queryFn: () => getRestaurant(id) });
  const { data: reviews, isLoading: reviewsLoading } = useQuery({ 
    queryKey: ["reviews", id], queryFn: () => listReviewsForRestaurant(id) 
  });
  const { data: images = [], isLoading: imagesLoading } = useQuery({
    queryKey: ["images", id],
    queryFn: () => listImagesForRestaurant(id),
  });

  // KÉPFELTÖLTÉS LOGIKA - Ezt adtam hozzá
  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file); // A backend valószínűleg "file" vagy "image" kulcsot vár
    formData.append("restaurantId", id);

    try {
      await api.post("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      await qc.invalidateQueries({ queryKey: ["images", id] });
      alert("Kép sikeresen feltöltve!");
    } catch (err) {
      alert("Hiba a feltöltés során: " + (err.response?.data || err.message));
    } finally {
      setIsUploading(false);
    }
  }

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

  if (isLoading) return <p className="container">Betöltés...</p>;
  if (error) return <p className="container" style={{ color: "crimson" }}>{error.message}</p>;
  if (!data?.restaurant) return <p className="container">Nincs adat.</p>;

  const r = data.restaurant;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>{r.name}</h1>
        {isAuthed && (
            <button className="btn" disabled={favMut.isPending} onClick={() => favMut.mutate()}>
                {favMut.isPending ? "…" : data.isFavorite ? "❤️ Kedvencem" : "🤍 Kedvencekhez"}
            </button>
        )}
      </div>
      
      <p className="p"><strong>Cím:</strong> {r.address}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
        <span className="badge">Konyha: {r.cuisine}</span>
        <span className="badge" style={{ background: "#6ee7ff22", color: "#6ee7ff" }}>⭐ {Number(data.averageRating || 0).toFixed(1)}</span>
        <span className="badge">💬 {data.reviewCount || 0} vélemény</span>
      </div>

      <div className="grid grid-2" style={{ marginTop: 20, alignItems: "start" }}>
        {/* KÉPEK SZEKCIÓ */}
        <div className="card card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
            <h3 style={{ margin: 0 }}>Képek</h3>
            {isAuthed && (
              <div>
                <input type="file" id="file-upload" style={{ display: "none" }} onChange={handleFileUpload} accept="image/*" />
                <label htmlFor="file-upload" className="btn btn-primary" style={{ cursor: "pointer", padding: "5px 10px", fontSize: "0.8rem" }}>
                  {isUploading ? "Töltés…" : "📸 Kép hozzáadása"}
                </label>
              </div>
            )}
          </div>
          
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
            {images.map((img) => (
              <img key={img.id} src={img.url} alt={r.name} style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: 8 }} />
            ))}
            {!imagesLoading && images.length === 0 && <p className="p" style={{ opacity: 0.5 }}>Még nincsenek képek.</p>}
          </div>
        </div>

        {/* ÉRTÉKELÉSEK SZEKCIÓ */}
        <div className="card card-pad">
          <h3>Vélemények</h3>
          {isAuthed && (
            <form onSubmit={(e) => { e.preventDefault(); reviewMut.mutate(); }} style={{ display: "grid", gap: 10, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>Értékelés:</span>
                <input className="input" type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ width: "60px" }} />
              </div>
              <textarea className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Milyen volt az étel?" style={{ height: "80px" }} />
              <button className="btn btn-primary" type="submit" disabled={reviewMut.isPending}>
                {reviewMut.isPending ? "Mentés…" : "Vélemény elküldése"}
              </button>
            </form>
          )}

          <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 15 }}>
            {(reviews?.reviews ?? []).map((rv) => (
              <div key={rv.id} style={{ borderBottom: "1px solid rgba(255,255,255,.05)", paddingBottom: 10 }}>
                <div style={{ color: "#6ee7ff", fontWeight: 700 }}>{"⭐".repeat(rv.rating)}</div>
                <p className="p" style={{ marginTop: 5 }}>{rv.comment || "(Csak csillaggal értékelt)"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
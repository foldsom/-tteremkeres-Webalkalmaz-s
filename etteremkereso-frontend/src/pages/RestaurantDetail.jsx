import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRestaurant } from "../api/restaurants";
import { listReviewsForRestaurant, upsertReview } from "../api/reviews";
import { listImagesForRestaurant } from "../api/images";
import { addFavorite, removeFavorite } from "../api/favorites";
import { useAuth } from "../store/useAuth";
import { api } from "../api/client";

export default function RestaurantDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { isAuthed } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data, isLoading, error } = useQuery({ queryKey: ["restaurant", id], queryFn: () => getRestaurant(id) });
  const { data: reviews } = useQuery({ queryKey: ["reviews", id], queryFn: () => listReviewsForRestaurant(id) });
  const { data: images = [] } = useQuery({ queryKey: ["images", id], queryFn: () => listImagesForRestaurant(id) });

  async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post(`/images/restaurant/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      await qc.invalidateQueries({ queryKey: ["images", id] });
      alert("Sikeres feltöltés!");
    } catch (err) {
      alert("Hiba: " + err.message);
    } finally { setIsUploading(false); }
  }

  const favMut = useMutation({
    mutationFn: async () => data?.isFavorite ? removeFavorite(id) : addFavorite(id),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["restaurant", id] }); await qc.invalidateQueries({ queryKey: ["favorites"] }); },
  });

  const reviewMut = useMutation({
    mutationFn: () => upsertReview(id, rating, comment),
    onSuccess: async () => { setComment(""); await qc.invalidateQueries({ queryKey: ["reviews", id] }); await qc.invalidateQueries({ queryKey: ["restaurant", id] }); },
  });

  if (isLoading) return <p className="container">Betöltés...</p>;
  if (error || !data?.restaurant) return <p className="container">Hiba az adatoknál.</p>;
  const r = data.restaurant;

  return (
    <div className="container" style={{ maxWidth: 1400, margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>{r.name}</h1>
          {isAuthed && (
            <button className="btn btn-primary" onClick={() => favMut.mutate()} disabled={favMut.isPending}>
              {data.isFavorite ? "💔 ELTÁVOLÍTÁS" : "❤️ KEDVENC"}
            </button>
          )}
      </div>
      <p><strong>Cím:</strong> {r.address}</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
        <span className="badge">Konyha: {r.cuisine}</span>
        <span className="badge">⭐ {Number(data.averageRating || 0).toFixed(1)}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 40, alignItems: "start" }}>
        <div className="card card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3>Galéria</h3>
            {isAuthed && (
              <>
                <input type="file" id="up" hidden onChange={handleFileUpload} accept="image/*" />
                <label htmlFor="up" className="btn btn-primary" style={{ cursor: "pointer" }}>{isUploading ? "..." : "📸 Feltöltés"}</label>
              </>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
            {images.map((img) => (
              <img 
                key={img.id} 
                src={img.url.startsWith('/') ? `https://localhost:7151${img.url}` : img.url} 
                alt="Etterem" 
                style={{ width: "100%", height: "auto", borderRadius: 8 }} 
              />
            ))}
          </div>
        </div>

        <div className="card card-pad" style={{ position: "sticky", top: 100 }}>
          <h3>Vélemények</h3>
          {isAuthed && (
            <form onSubmit={(e) => { e.preventDefault(); reviewMut.mutate(); }} style={{ display: "grid", gap: 10, marginBottom: 20 }}>
              <input className="input" type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
              <textarea className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Véleményed..." style={{ height: "80px" }} />
              <button className="btn btn-primary" type="submit" disabled={reviewMut.isPending}>Mentés</button>
            </form>
          )}
          {reviews?.reviews?.map((rv) => (
            <div key={rv.id} style={{ borderBottom: "1px solid rgba(255,255,255,.05)", padding: "10px 0" }}>
              <div style={{ color: "#6ee7ff" }}>{"⭐".repeat(rv.rating)}</div>
              <p>{rv.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
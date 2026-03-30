import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFavorites, removeFavorite } from "../api/favorites";

export default function Favorites() {
  const qc = useQueryClient();
  const { data = [], isLoading, error } = useQuery({ queryKey: ["favorites"], queryFn: listFavorites });

  const removeMut = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] })
  });

  return (
    <div className="container" style={{ maxWidth: 1200, padding: "40px 20px" }}>
      <h1>Kedvencek</h1>
      {isLoading && <p>Betöltés...</p>}
      {error && <p style={{ color: "crimson" }}>{error.message}</p>}
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(450px, 1fr))", gap: 20 }}>
        {data.map((r) => (
          <div key={r.id} className="card card-pad" style={{ display: "flex", gap: 15 }}>
            <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                {r.imageUrl ? (
                    <img 
                        src={r.imageUrl.startsWith('/') ? `https://localhost:7151${r.imageUrl}` : r.imageUrl} 
                        alt={r.name} 
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }} 
                    />
                ) : (
                    <div style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.05)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>🍽️</div>
                )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Link to={`/restaurants/${r.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{r.name}</h2>
                </Link>
                <button onClick={() => removeMut.mutate(r.id)} style={{ background: "transparent", border: "none", color: "crimson", cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ marginTop: 5 }}>
                <span className="badge" style={{ marginRight: 10 }}>{r.cuisine}</span>
                <span style={{ color: "#ffcc00" }}>
                  {r.reviewCount > 0 ? `⭐ ${Number(r.averageRating || 0).toFixed(1)}` : "Nincs értékelés"}
                </span>
              </div>
              <p style={{ fontSize: "0.9rem", opacity: 0.7, margin: "5px 0" }}>{r.address}</p>
              {r.latestReview && (
                <p style={{ fontSize: "0.85rem", fontStyle: "italic", opacity: 0.6, borderLeft: "2px solid #6ee7ff", paddingLeft: 8 }}>
                    "{r.latestReview.length > 60 ? r.latestReview.substring(0, 60) + "..." : r.latestReview}"
                </p>
              )}
            </div>
          </div>
        ))}
        {!isLoading && data.length === 0 && <p>Még nincs kedvenc éttermed.</p>}
      </div>
    </div>
  );
}
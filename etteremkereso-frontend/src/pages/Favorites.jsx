import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listFavorites } from "../api/favorites";

export default function Favorites() {
  const { data = [], isLoading, error } = useQuery({ queryKey: ["favorites"], queryFn: listFavorites });

  return (
    <div className="container">
      <h1>Kedvencek</h1>
      {isLoading && <p>Betöltés...</p>}
      {error && <p style={{ color: "crimson" }}>{error.message}</p>}
      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {data.map((r) => (
          <Link key={r.id} to={`/restaurants/${r.id}`} className="card card-pad">
            <div style={{ fontWeight: 800 }}>{r.name}</div>
            <p className="p">{r.address}</p>
          </Link>
        ))}
        {!isLoading && data.length === 0 && <p>Még nincs kedvenc éttermed.</p>}
      </div>
    </div>
  );
}

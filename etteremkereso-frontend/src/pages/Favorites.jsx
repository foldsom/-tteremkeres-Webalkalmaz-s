import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listFavorites, removeFavorite } from "../api/favorites";

export default function Favorites() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["favorites"], queryFn: listFavorites });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["restaurants", "map"] });
    },
  });

  return (
    <div className="container">
      <h1>Kedvencek</h1>
      {isLoading && <p className="p">Betöltés…</p>}
      {error && <p style={{ color: "#fda4af" }}>{error.message}</p>}

      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {(data ?? []).map((r) => (
          <div key={r.id} className="card card-pad" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <Link to={`/restaurants/${r.id}`} style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800 }}>{r.name}</div>
              <p className="p">{r.address}</p>
            </Link>
            <button className="btn" onClick={() => removeMutation.mutate(r.id)}>
              Eltávolítás
            </button>
          </div>
        ))}
      </div>

      {!isLoading && !error && (data ?? []).length === 0 && <p className="p">Még nincs kedvenc éttermed.</p>}
    </div>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyPreferences, listPreferences, setMyPreferences } from "../api/preferences";
import { getRecommendations } from "../api/recommendations";

export default function Profile() {
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");

  const { data: allPrefs, isLoading: prefLoading } = useQuery({
    queryKey: ["preferences"],
    queryFn: listPreferences,
  });

  const { data: myPrefs, isLoading: myPrefLoading } = useQuery({
    queryKey: ["me", "preferences"],
    queryFn: getMyPreferences,
  });

  const { data: recs, isLoading: recLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: getRecommendations,
  });

  const ids = (myPrefs ?? []).map((x) => x.preferenceId);

  const saveMutation = useMutation({
    mutationFn: setMyPreferences,
    onSuccess: () => {
      setMsg("Preferenciák mentve.");
      qc.invalidateQueries({ queryKey: ["me", "preferences"] });
      qc.invalidateQueries({ queryKey: ["recommendations"] });
    },
  });

  function toggle(id) {
    setMsg("");
    const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
    saveMutation.mutate(next);
  }

  return (
    <div className="container">
      <h1>Profil és ajánlások</h1>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 800 }}>Étkezési preferenciák</div>

        {(prefLoading || myPrefLoading) && <p className="p">Betöltés…</p>}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(allPrefs ?? []).map((p) => (
            <button
              key={p.id}
              type="button"
              className="btn"
              onClick={() => toggle(p.id)}
              style={{
                borderColor: ids.includes(p.id) ? "rgba(110,231,255,0.45)" : "rgba(255,255,255,0.10)",
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {msg && <p style={{ color: "#86efac" }}>{msg}</p>}
        {saveMutation.error && <p style={{ color: "#fda4af" }}>{saveMutation.error.message}</p>}
      </div>

      <div className="card card-pad">
        <div style={{ marginBottom: 8, fontWeight: 800 }}>Ajánlott éttermek</div>
        {recLoading && <p className="p">Betöltés…</p>}
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          {(recs?.restaurants ?? []).map((r) => (
            <div key={r.id}>
              {r.name} <span className="badge">{r.cuisine}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

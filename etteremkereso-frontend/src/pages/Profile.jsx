import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPreferences, getMyPreferences, setMyPreferences } from "../api/preferences";
import { listRecommendations } from "../api/recommendations";

const hungarianLabels = {
  "Cuisine:Hungarian": "Magyaros",
  "Cuisine:Italian": "Olasz",
  "Cuisine:Mexican": "Mexikói",
  "Cuisine:Vegan": "Vegán",
  "Cuisine:Vegetarian": "Vegetáriánus",
  "Price:1": "Olcsó (€)",
  "Price:2": "Közepes (€€)",
  "Price:3": "Drága (€€€)"
};

export default function Profile() {
  const [msg, setMsg] = useState("");
  const [savingId, setSavingId] = useState(null);

  const { data: all = [], isLoading: allLoading, error: allError } = useQuery({ queryKey: ["preferences"], queryFn: listPreferences });
  const { data: mine = [], isLoading: mineLoading, error: mineError, refetch: refetchMine } = useQuery({ queryKey: ["me", "preferences"], queryFn: getMyPreferences });
  const { data: rec = null, isLoading: recLoading, error: recError, refetch: refetchRec } = useQuery({ queryKey: ["recommendations"], queryFn: listRecommendations });

  const selected = new Set(mine.map((x) => x.preferenceId));

  async function onToggle(id) {
    setMsg("");
    setSavingId(id);
    try {
      const next = selected.has(id) ? [...selected].filter((x) => x !== id) : [...selected, id];
      await setMyPreferences(next);
      await refetchMine();
      await refetchRec();
      setMsg("Preferenciák mentve.");
    } catch {
      setMsg("Hiba mentés közben.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="container">
      <h1>Profil & preferenciák</h1>
      {msg && <p style={{ color: msg.includes("Hiba") ? "crimson" : "#6ee7ff" }}>{msg}</p>}
      <div className="card card-pad" style={{ marginBottom: 14 }}>
        {allLoading || mineLoading ? <p className="p">Preferenciák betöltése…</p> : null}
        {!allLoading && !mineLoading && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {all.map((p) => (
              <button
                type="button"
                key={p.id}
                className="btn"
                disabled={savingId !== null}
                style={{ borderColor: selected.has(p.id) ? "rgba(110,231,255,0.6)" : undefined }}
                onClick={() => onToggle(p.id)}
              >
                {savingId === p.id ? "Mentés…" : (hungarianLabels[p.name] || p.name)}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="card card-pad">
        <h3>Ajánlott éttermek</h3>
        {recLoading && <p className="p">Ajánlások betöltése…</p>}
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          {(rec?.restaurants ?? []).slice(0, 8).map((r) => (
            <div key={r.id} style={{ marginBottom: 10 }}>
              <strong>{r.name}</strong> <span className="badge">{r.cuisine}</span>
              <p className="p">{r.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
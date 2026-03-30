import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listPreferences, getMyPreferences, setMyPreferences } from "../api/preferences";
import { listRecommendations } from "../api/recommendations";

// FORDÍTÓ LISTA - Ezt adtam hozzá
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

  const { data: all = [], isLoading: allLoading, error: allError } = useQuery({ 
    queryKey: ["preferences"], queryFn: listPreferences 
  });

  const { data: mine = [], isLoading: mineLoading, error: mineError, refetch: refetchMine } = useQuery({ 
    queryKey: ["me", "preferences"], queryFn: getMyPreferences 
  });

  const { data: rec = null, isLoading: recLoading, error: recError, refetch: refetchRec } = useQuery({ 
    queryKey: ["recommendations"], queryFn: listRecommendations 
  });

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
      {msg && <p style={{ color: msg.includes("Hiba") ? "crimson" : "#6ee7ff", fontWeight: 700 }}>{msg}</p>}

      <div className="card card-pad" style={{ marginBottom: 14 }}>
        <h3>Milyen ételeket szeretsz?</h3>
        {allLoading || mineLoading ? <p className="p">Betöltés…</p> : null}

        {!allLoading && !mineLoading && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {all.map((p) => (
              <button
                type="button"
                key={p.id}
                className="btn"
                disabled={savingId !== null}
                style={{ 
                    borderColor: selected.has(p.id) ? "#6ee7ff" : "rgba(255,255,255,0.1)",
                    background: selected.has(p.id) ? "rgba(110,231,255,0.15)" : "transparent",
                    color: selected.has(p.id) ? "white" : "rgba(255,255,255,0.6)"
                }}
                onClick={() => onToggle(p.id)}
              >
                {savingId === p.id ? "Mentés…" : (hungarianLabels[p.name] || p.name)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card card-pad">
        <h3>Neked ajánljuk Debrecenben</h3>
        {recLoading && <p className="p">Séfünk válogatja az ajánlatokat…</p>}
        <div className="grid" style={{ gridTemplateColumns: "1fr", gap: 15, marginTop: 10 }}>
          {(rec?.restaurants ?? []).slice(0, 8).map((r) => (
            <div key={r.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 10 }}>
              <strong style={{ fontSize: "1.1rem" }}>{r.name}</strong> <span className="badge">{r.cuisine}</span>
              <p className="p" style={{ opacity: 0.6, fontSize: "0.9rem" }}>{r.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
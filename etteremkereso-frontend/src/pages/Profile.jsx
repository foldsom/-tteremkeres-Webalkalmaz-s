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
  "Cuisine:Indian": "Indiai",
  "Cuisine:Asian": "Ázsiai",
  "Cuisine:Mediterranean": "Mediterrán",
  "Cuisine:Turkish": "Török",
  "Price:1": "Olcsó (€)",
  "Price:2": "Közepes (€€)",
  "Price:3": "Drága (€€€)",
  "Style:Bistro": "Bisztró",
  "Style:StreetFood": "Street food",
  "Style:Seafood": "Halételek",
  "Style:Burger": "Burger",
  "Style:FastFood": "Fast food"
};

function normalizeCuisineLabel(cuisine) {
  const text = cuisine?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? "";
  if (text.includes("magyar") || text.includes("hungar")) return "Magyaros";
  if (text.includes("olasz") || text.includes("pizza") || text.includes("ital")) return "Olasz";
  if (text.includes("mex")) return "Mexikói";
  if (text.includes("vega") || text.includes("vegetar")) return "Vegán / Vegetáriánus";
  if (text.includes("azsiai") || text.includes("asian")) return "Ázsiai";
  if (text.includes("indiai") || text.includes("indian")) return "Indiai";
  if (text.includes("mediterran") || text.includes("mediterranean")) return "Mediterrán";
  if (text.includes("torok") || text.includes("turkish")) return "Török";
  if (text.includes("bisztro") || text.includes("bistro")) return "Bisztró";
  if (text.includes("street")) return "Street food";
  if (text.includes("hal") || text.includes("seafood")) return "Halételek";
  if (text.includes("burger")) return "Burger";
  if (text.includes("fast")) return "Fast food";
  return cuisine;
}

export default function Profile() {
  const [msg, setMsg] = useState("");
  const [savingId, setSavingId] = useState(null);

  const { data: all = [], isLoading: allLoading, error: allError } = useQuery({ queryKey: ["preferences"], queryFn: listPreferences });
  const { data: mine = [], isLoading: mineLoading, error: mineError, refetch: refetchMine } = useQuery({ queryKey: ["me", "preferences"], queryFn: getMyPreferences });
  const { data: rec = null, isLoading: recLoading, error: recError, refetch: refetchRec } = useQuery({ queryKey: ["recommendations"], queryFn: listRecommendations });

  const selected = new Set(mine.map((x) => x.preferenceId));
  const hasSelectedPreference = selected.size > 0;
  const cuisinePreferences = all.filter((p) => p.name?.startsWith("Cuisine:"));
  const stylePreferences = all.filter((p) => p.name?.startsWith("Style:"));
  const pricePreferences = all.filter((p) => p.name?.startsWith("Price:"));
  const veganPrefIds = cuisinePreferences
    .filter((p) => p.name === "Cuisine:Vegan" || p.name === "Cuisine:Vegetarian")
    .map((p) => p.id);
  const otherCuisinePreferences = cuisinePreferences.filter(
    (p) => p.name !== "Cuisine:Vegan" && p.name !== "Cuisine:Vegetarian"
  );

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

  async function onToggleGroup(ids) {
    setMsg("");
    setSavingId(ids[0] ?? null);
    try {
      const allSelected = ids.every((id) => selected.has(id));
      const next = allSelected
        ? [...selected].filter((x) => !ids.includes(x))
        : [...new Set([...selected, ...ids])];

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
      {(allError || mineError) && (
        <p style={{ color: "crimson" }}>Nem sikerült betölteni a preferenciákat.</p>
      )}
      <div className="card card-pad" style={{ marginBottom: 14 }}>
        {allLoading || mineLoading ? <p className="p">Preferenciák betöltése…</p> : null}
        {!allLoading && !mineLoading && (
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>Ország / konyha</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {otherCuisinePreferences.map((p) => (
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
                {veganPrefIds.length > 0 && (
                  <button
                    type="button"
                    className="btn"
                    disabled={savingId !== null}
                    style={{ borderColor: veganPrefIds.every((id) => selected.has(id)) ? "rgba(110,231,255,0.6)" : undefined }}
                    onClick={() => onToggleGroup(veganPrefIds)}
                  >
                    {savingId !== null && veganPrefIds.includes(savingId) ? "Mentés…" : "Vegán / Vegetáriánus"}
                  </button>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>Stílus / típus</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {stylePreferences.map((p) => (
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
            </div>

            <div>
              <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>Árkategória</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {pricePreferences.map((p) => (
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
            </div>
          </div>
        )}
      </div>
      <div className="card card-pad">
        <h3>Ajánlott éttermek</h3>
        {recLoading && <p className="p">Ajánlások betöltése…</p>}
        {!recLoading && !hasSelectedPreference && (
          <p className="p">Válassz legalább egy preferenciát, és itt fognak megjelenni az ajánlott éttermek.</p>
        )}
        {!recLoading && hasSelectedPreference && (rec?.restaurants?.length ?? 0) === 0 && (
          <p className="p">A beállított preferenciákra most nincs találat.</p>
        )}
        {recError && <p style={{ color: "crimson" }}>Nem sikerült betölteni az ajánlásokat.</p>}
        {hasSelectedPreference && (
          <div className="grid" style={{ gridTemplateColumns: "1fr", maxHeight: 540, overflowY: "auto", paddingRight: 6 }}>
            {(rec?.restaurants ?? []).map((r) => (
              <div key={r.id} style={{ marginBottom: 10 }}>
                <strong>{r.name}</strong> <span className="badge">{normalizeCuisineLabel(r.cuisine)}</span>
                <p className="p">{r.address}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
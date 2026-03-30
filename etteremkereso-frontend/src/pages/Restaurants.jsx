import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listMapRestaurants } from "../api/restaurants";

const CENTER = [47.5316, 21.6273];

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (!document.getElementById("leaflet-css")) {
    const css = document.createElement("link");
    css.id = "leaflet-css"; css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function Restaurants() {
  const [q, setQ] = useState("");
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["restaurants", "map"],
    queryFn: listMapRestaurants,
  });

  const restaurants = useMemo(
    () => (data ?? []).filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude)),
    [data]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return restaurants;
    return restaurants.filter((r) => 
        `${r.name} ${r.cuisine} ${r.address}`.toLowerCase().includes(s)
    );
  }, [q, restaurants]);

  useEffect(() => {
    loadLeaflet().then((L) => {
      if (!mapEl.current) return;
      if (!mapRef.current) {
        mapRef.current = L.map(mapEl.current).setView(CENTER, 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap',
        }).addTo(mapRef.current);
        layerRef.current = L.layerGroup().addTo(mapRef.current);
      }
      layerRef.current.clearLayers();
      filtered.forEach((r) => {
        L.marker([r.latitude, r.longitude])
          .bindPopup(`<strong>${r.name}</strong><br/>${r.cuisine}`)
          .addTo(layerRef.current);
      });
    });
  }, [filtered]);

  return (
    <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 20px" }}>
      <div style={{ 
        position: "sticky", top: "70px", zIndex: 100, // Magasabb z-index, hogy minden felett legyen
        background: "#0b0f19", padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
          <h1 style={{ margin: 0 }}>Éttermek Debrecenben</h1>
          <div style={{ width: "450px" }}>
            <input
              className="input"
              style={{ width: "100%", padding: "14px", pointerEvents: "auto" }} // pointer-events: auto a biztonság kedvéért
              placeholder="Keresés név, konyha vagy cím alapján…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2.2fr 0.8fr", gap: 24, marginTop: 20, alignItems: "start" }}>
        <div style={{ position: "sticky", top: "150px", height: "calc(100vh - 170px)" }}>
          <div className="card" style={{ height: "100%" }}>
            <div ref={mapEl} style={{ height: "100%", width: "100%", borderRadius: "12px" }} />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          {isLoading && <p>Betöltés…</p>}
          {!isLoading && filtered.map((r) => (
            <Link key={r.id} to={`/restaurants/${r.id}`} className="card card-pad" style={{ textDecoration: "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900, fontSize: "1.2rem" }}>{r.name}</div>
                <span className="badge">{r.cuisine}</span>
              </div>
              <p className="p" style={{ opacity: 0.6, margin: "8px 0" }}>{r.address}</p>
              <div style={{ fontWeight: 700, color: "#6ee7ff" }}>Részletek →</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
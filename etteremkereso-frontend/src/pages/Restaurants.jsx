import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const CENTER = [47.5316, 21.6273];

const restaurants = [
  { id: 1, name: "IKON Restaurant", category: "Modern magyar", address: "Debrecen, Piac utca 23.", lat: 47.5317, lng: 21.6252 },
  { id: 2, name: "Bonita Bistro", category: "Mediterrán", address: "Debrecen, Simonffy utca 5.", lat: 47.5298, lng: 21.6298 },
  { id: 3, name: "Wasabi Running Sushi", category: "Ázsiai", address: "Debrecen, Csapó utca 30.", lat: 47.5328, lng: 21.6331 },
  { id: 4, name: "Vintage World", category: "Nemzetközi", address: "Debrecen, Piac utca 43.", lat: 47.5325, lng: 21.6234 },
  { id: 5, name: "Reskontó", category: "Magyar", address: "Debrecen, Péterfia utca 34.", lat: 47.5354, lng: 21.6228 },
];

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);

  if (!document.getElementById("leaflet-css")) {
    const css = document.createElement("link");
    css.id = "leaflet-css";
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    css.crossOrigin = "";
    document.head.appendChild(css);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("leaflet-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "leaflet-js";
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.async = true;
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

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return restaurants;
    return restaurants.filter((r) => `${r.name} ${r.category} ${r.address}`.toLowerCase().includes(s));
  }, [q]);

  useEffect(() => {
    let alive = true;

    loadLeaflet()
      .then((L) => {
        if (!alive || !mapEl.current) return;

        if (!mapRef.current) {
          mapRef.current = L.map(mapEl.current).setView(CENTER, 14);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(mapRef.current);
          layerRef.current = L.layerGroup().addTo(mapRef.current);
        }

        layerRef.current.clearLayers();
        filtered.forEach((r) => {
          window.L.marker([r.lat, r.lng])
            .bindPopup(`<strong>${r.name}</strong><br/>${r.category}<br/>${r.address}`)
            .addTo(layerRef.current);
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [filtered]);

  useEffect(
    () => () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    },
    []
  );

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, letterSpacing: "-0.02em" }}>Éttermek Debrecenben</h1>
        <div style={{ width: 320, maxWidth: "100%" }}>
          <input
            className="input"
            placeholder="Keresés név / kategória / cím szerint…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="grid grid-2">
        <div className="card card-pad">
          <div ref={mapEl} className="restaurants-map" />
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          {filtered.map((r) => (
            <Link key={r.id} to={`/restaurants/${r.id}`} className="card card-pad">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 900, letterSpacing: "-0.01em" }}>{r.name}</div>
                <span className="badge">{r.category}</span>
              </div>
              <p className="p" style={{ marginTop: 8 }}>{r.address}</p>
              <div style={{ marginTop: 12, fontWeight: 700, color: "rgba(110,231,255,0.9)" }}>Részletek →</div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="card card-pad">
              <p className="p">Nincs találat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

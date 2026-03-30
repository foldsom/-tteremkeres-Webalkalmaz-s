import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listMapRestaurants } from "../api/restaurants";

const CENTER = [47.5316, 21.6273];

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

  const { data, isLoading, error } = useQuery({
    queryKey: ["restaurants", "map"],
    queryFn: listMapRestaurants,
  });

  const restaurants = useMemo(
    () =>
      (data ?? [])
        .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
        .map((r) => ({
          id: r.id,
          name: r.name,
          category: r.cuisine,
          address: r.address,
          lat: r.latitude,
          lng: r.longitude,
        })),
    [data]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return restaurants;
    return restaurants.filter((r) => `${r.name} ${r.category} ${r.address}`.toLowerCase().includes(s));
  }, [q, restaurants]);

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
          L.marker([r.lat, r.lng])
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
  <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 20px" }}>
    
    {/* 1. FIXÁLT CÍMSOR ÉS KERESŐ */}
    <div style={{ 
      position: "sticky", 
      top: "65px", // Ez a Navbar magassága után jön
      zIndex: 45, 
      background: "#0b0f19", // Fontos, hogy ne legyen átlátszó
      padding: "20px 0",
      borderBottom: "1px solid rgba(255,255,255,0.05)"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0, letterSpacing: "-0.02em", fontSize: "2rem" }}>Éttermek Debrecenben</h1>
        <div style={{ width: 450, maxWidth: "100%" }}>
          <input
            className="input"
            placeholder="Keresés név / kategória / cím szerint…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
          />
        </div>
      </div>
    </div>

    <div style={{ height: 20 }} />

    {/* 2. SZÉLESEBB TÉRKÉP ÉS LISTA ELRENDEZÉS */}
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "1.6fr 1fr", // A térkép (1.6) most már sokkal szélesebb
      gap: 30, 
      alignItems: "start" 
    }}>
      
      {/* TÉRKÉP KONTÉNER - Követi a görgetést */}
      <div style={{ 
        position: "sticky", 
        top: "180px", // A Navbar + Fix címsor után
        height: "calc(100vh - 210px)",
        minHeight: "500px"
      }}>
        <div className="card" style={{ height: "100%", border: "1px solid rgba(110,231,255,0.15)", boxShadow: "0 0 20px rgba(0,0,0,0.5)" }}>
           <div ref={mapEl} style={{ height: "100%", width: "100%", borderRadius: "12px" }} />
        </div>
      </div>

      {/* ÉTTEREM LISTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 50 }}>
        {isLoading && <p className="p" style={{ textAlign: "center", padding: 40 }}>Séfünk tölti az adatokat...</p>}
        
        {error && <p className="p" style={{ color: "#fda4af" }}>Hiba történt a betöltéskor.</p>}

        {!isLoading && filtered.map((r) => (
          <Link key={r.id} to={`/restaurants/${r.id}`} className="card card-pad" style={{ 
            textDecoration: "none", 
            border: "1px solid rgba(255,255,255,0.05)",
            transition: "all 0.2s ease"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "white" }}>{r.name}</div>
              <span className="badge" style={{ background: "rgba(110,231,255,0.1)", color: "#6ee7ff", border: "1px solid rgba(110,231,255,0.2)" }}>
                {r.category}
              </span>
            </div>
            <p className="p" style={{ opacity: 0.6, fontSize: "0.95rem", margin: "10px 0" }}>{r.address}</p>
            <div style={{ fontWeight: 700, color: "#6ee7ff", display: "flex", alignItems: "center", gap: 5 }}>
              Részletek megnyitása <span style={{ fontSize: "1.2rem" }}>→</span>
            </div>
          </Link>
        ))}

        {!isLoading && filtered.length === 0 && (
          <div className="card card-pad" style={{ textAlign: "center", opacity: 0.5 }}>
            <p className="p">Nincs ilyen étterem Debrecenben...</p>
          </div>
        )}
      </div>
    </div>
  </div>
);
}
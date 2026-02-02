import { Link } from "react-router-dom";

const demo = [
  { id: 1, name: "Példa Étterem 1", category: "Olasz", address: "Budapest, Példa utca 1." },
  { id: 2, name: "Példa Étterem 2", category: "Vegán", address: "Budapest, Példa tér 2." },
  { id: 3, name: "Példa Étterem 3", category: "Burger", address: "Budapest, Példa körút 3." },
];

export default function Restaurants() {
  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 14 }}>
        <div>
          <h1 style={{ margin: 0, letterSpacing: "-0.02em" }}>Éttermek</h1>
          <p className="p" style={{ marginTop: 6 }}>Böngéssz és nyisd meg a részleteket.</p>
        </div>

        <div style={{ width: 320, maxWidth: "100%" }}>
          <input className="input" placeholder="Keresés név / kategória szerint…" />
        </div>
      </div>

      <div style={{ height: 12 }} />

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {demo.map((r) => (
          <Link key={r.id} to={`/restaurants/${r.id}`} className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 900, letterSpacing: "-0.01em" }}>{r.name}</div>
              <span className="badge">{r.category}</span>
            </div>
            <p className="p" style={{ marginTop: 8 }}>{r.address}</p>
            <div style={{ marginTop: 12, fontWeight: 700, color: "rgba(110,231,255,0.9)" }}>
              Részletek →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

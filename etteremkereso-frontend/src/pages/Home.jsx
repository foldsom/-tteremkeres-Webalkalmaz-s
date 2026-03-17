import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container">
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div>
          <div className="badge">✨ személyre szabott ajánlások</div>
          <h1 className="h1" style={{ marginTop: 14 }}>
            Találd meg a következő kedvenc éttermed.
          </h1>
          <p className="p" style={{ maxWidth: 560 }}>
            Szűrés kategóriák szerint, kedvencek mentése, értékelések és vélemények —
            térképes nézettel és preferencia alapú ajánlásokkal.
          </p>

          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <Link className="btn btn-primary" to="/restaurants">
              Éttermek böngészése →
            </Link>
            <Link className="btn" to="/profile">
              Preferenciáim
            </Link>
          </div>

          <hr className="hr" />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span className="badge">❤️ kedvencek</span>
            <span className="badge">⭐ 1–5 értékelés</span>
            <span className="badge">🗺️ térkép</span>
            <span className="badge">📷 képek</span>
          </div>
        </div>

        <div className="card card-pad">
          <div style={{ fontWeight: 800, letterSpacing: "-0.01em", marginBottom: 8 }}>
            Gyors indulás
          </div>
          <p className="p" style={{ marginBottom: 12 }}>
            Regisztrálj, állítsd be preferenciáidat, majd nézd meg az ajánlásokat a profil oldalon.
          </p>
          <Link className="btn btn-primary" to="/register">
            Regisztráció
          </Link>
        </div>
      </div>
    </div>
  );
}

import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../store/useAuth";

function Item({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid",
        borderColor: isActive ? "rgba(110,231,255,0.45)" : "rgba(255,255,255,0.10)",
        background: isActive ? "rgba(110,231,255,0.10)" : "rgba(255,255,255,0.05)",
        color: "rgba(255,255,255,0.88)",
        fontWeight: 700,
        fontSize: 14,
      })}
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { isAuthed, user, doLogout } = useAuth();

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(10px)" }}>
      <div
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(11,15,25,0.55)",
        }}
      >
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background:
                  "linear-gradient(135deg, rgba(110,231,255,0.22), rgba(167,139,250,0.20))",
              }}
            />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>Étteremkereső</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                ajánlások • kedvencek • értékelések
              </div>
            </div>
          </Link>

          <div style={{ flex: 1 }} />

          <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Item to="/restaurants">Éttermek</Item>

            {isAuthed ? (
              <>
                <Item to="/favorites">Kedvencek</Item>
                <Item to="/profile">{user?.username || "Profil"}</Item>
                <button className="btn" onClick={doLogout}>
                  Kilépés
                </button>
              </>
            ) : (
              <>
                <Item to="/login">Belépés</Item>
                <NavLink to="/register" className="btn btn-primary">
                  Regisztráció
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

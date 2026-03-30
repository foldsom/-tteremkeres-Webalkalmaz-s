import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../store/useAuth";
import logo from "../assets/logo.svg";

function Item({ to, children }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid",
        borderColor: isActive ? "rgba(110,231,255,0.45)" : "transparent",
        background: isActive ? "rgba(110,231,255,0.10)" : "transparent",
        color: "rgba(255,255,255,0.88)",
        fontWeight: 700,
        fontSize: 14,
        textDecoration: "none"
      })}
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const { isAuthed, user, doLogout } = useAuth();

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(12px)" }}>
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.10)", background: "rgba(11,15,25,0.75)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "white" }}>
            <img src={logo} alt="Logo" style={{ width: 38, height: 38 }} />
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 900, letterSpacing: "-0.02em", fontSize: "1.1rem" }}>Étteremkereső</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.50)", textTransform: "uppercase" }}>ajánlások • kedvencek • értékelések</div>
            </div>
          </Link>
          <div style={{ flex: 1 }} />
          <nav style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Item to="/restaurants">Éttermek</Item>
            {isAuthed ? (
              <>
                <Item to="/favorites">Kedvencek</Item>
                <Item to="/profile">{user?.username || "Profil"}</Item>
                <button className="btn" onClick={doLogout} style={{ background: "rgba(255,100,100,0.1)", color: "#ff6b6b" }}>Kilépés</button>
              </>
            ) : (
              <>
                <Item to="/login">Belépés</Item>
                <Item to="/register">Regisztráció</Item>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
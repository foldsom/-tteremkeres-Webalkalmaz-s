import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Navbar() {
  const { isAuthed, user, doLogout } = useAuth();

  return (
    <header style={{ borderBottom: "1px solid #eee" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, display: "flex", gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/restaurants">Éttermek</Link>

        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          {isAuthed ? (
            <>
              <Link to="/favorites">Kedvencek</Link>
              <Link to="/profile">{user?.username || "Profil"}</Link>
              <button onClick={doLogout}>Kilépés</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

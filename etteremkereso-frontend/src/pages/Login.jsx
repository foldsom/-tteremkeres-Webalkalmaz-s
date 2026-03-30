import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";

export default function Login() {
  const { doLogin } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await doLogin(email, password);
      nav("/restaurants");
    } catch (e2) {
      setErr("Hibás email cím vagy jelszó!");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 600, padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px", textAlign: "center" }}>Bejelentkezés</h1>
      
      <form 
        onSubmit={onSubmit} 
        className="card card-pad" 
        style={{ 
          display: "grid", 
          gap: 20, 
          padding: "40px",
          border: "1px solid rgba(255,255,255,0.05)" 
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 700, opacity: 0.8 }}>Email cím</label>
          <input 
            className="input" 
            placeholder="pelda@email.hu" 
            type="email"
            style={{ padding: "16px", fontSize: "1.1rem" }}
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          <label style={{ fontWeight: 700, opacity: 0.8 }}>Jelszó</label>
          <input
            className="input"
            placeholder="••••••••"
            type="password"
            style={{ padding: "16px", fontSize: "1.1rem" }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {err && (
          <p style={{ 
            color: "crimson", 
            background: "rgba(220, 20, 60, 0.1)", 
            padding: "10px", 
            borderRadius: "8px", 
            textAlign: "center",
            fontWeight: 600 
          }}>
            {err}
          </p>
        )}

        <button 
          className="btn btn-primary" 
          type="submit" 
          style={{ 
            padding: "16px", 
            fontSize: "1.2rem", 
            marginTop: "10px",
            fontWeight: 900 
          }}
        >
          Belépés
        </button>
      </form>
      
      <p style={{ textAlign: "center", marginTop: "20px", opacity: 0.6 }}>
        Még nincs fiókod? <span style={{ color: "#6ee7ff", cursor: "pointer" }} onClick={() => nav("/register")}>Regisztrálj itt!</span>
      </p>
    </div>
  );
}
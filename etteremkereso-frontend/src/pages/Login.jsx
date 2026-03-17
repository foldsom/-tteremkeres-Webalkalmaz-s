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
      setErr(e2.message);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 480 }}>
      <h1>Bejelentkezés</h1>
      <form onSubmit={onSubmit} className="card card-pad" style={{ display: "grid", gap: 10 }}>
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="input"
          placeholder="Jelszó"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {err && <p style={{ color: "crimson" }}>{err}</p>}
        <button className="btn btn-primary" type="submit">Belépés</button>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Login() {
  const { doLogin } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await doLogin(form.email, form.password);
      nav("/restaurants");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="card card-pad">
        <h1 style={{ marginTop: 0 }}>Bejelentkezés</h1>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Jelszó"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {err && <p style={{ color: "#fda4af", margin: 0 }}>{err}</p>}
          <button className="btn btn-primary" type="submit">
            Belépés
          </button>
        </form>
      </div>
    </div>
  );
}

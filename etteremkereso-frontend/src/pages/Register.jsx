import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function Register() {
  const { doRegister } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    preferences: "",
  });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await doRegister(form);
      nav("/restaurants");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <h1>Regisztráció</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input placeholder="Felhasználónév" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })} />
        <input placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Jelszó" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <input placeholder="Preferenciák (pl. vegán, olasz, csípős…)" value={form.preferences}
          onChange={(e) => setForm({ ...form, preferences: e.target.value })} />
        {err && <p style={{ color: "crimson" }}>{err}</p>}
        <button type="submit">Fiók létrehozása</button>
      </form>
    </div>
  );
}

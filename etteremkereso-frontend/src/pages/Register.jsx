import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../store/useAuth";
import { listPreferences } from "../api/preferences";

const hungarianLabels = {
  "Cuisine:Hungarian": "Magyaros", "Cuisine:Italian": "Olasz", "Cuisine:Mexican": "Mexikói",
  "Cuisine:Vegan": "Vegán", "Cuisine:Vegetarian": "Vegetáriánus", "Price:1": "Olcsó (€)",
  "Price:2": "Közepes (€€)", "Price:3": "Drága (€€€)"
};

export default function Register() {
  const { doRegister } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [selected, setSelected] = useState([]);
  const [err, setErr] = useState("");

  const { data: preferences = [], isLoading: prefsLoading } = useQuery({ queryKey: ["preferences"], queryFn: listPreferences });

  const grouped = useMemo(() => {
    const byGroup = { Cuisine: [], Price: [] };
    preferences.forEach((p) => {
      if (p.name.startsWith("Cuisine:")) byGroup.Cuisine.push(p);
      else if (p.name.startsWith("Price:")) byGroup.Price.push(p);
    });
    return byGroup;
  }, [preferences]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await doRegister({ ...form, preferenceIds: selected });
      nav("/login");
    } catch (e2) {
      setErr("Hiba a regisztráció során!");
    }
  }

  return (
    <div className="container" style={{ maxWidth: 800, padding: "40px 20px" }}>
      <h1 style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: "30px" }}>Regisztráció</h1>
      <form onSubmit={onSubmit} className="card card-pad" style={{ display: "grid", gap: 20, padding: "40px" }}>
        <input className="input" style={{ padding: "16px" }} placeholder="Felhasználónév" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input className="input" style={{ padding: "16px" }} placeholder="Email cím" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input className="input" style={{ padding: "16px" }} placeholder="Jelszó" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <div style={{ marginTop: "10px" }}>
          <strong>Milyen ételeket szeretsz?</strong>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: "10px" }}>
            {grouped.Cuisine.map((p) => (
              <button type="button" key={p.id} className="btn" style={{ background: selected.includes(p.id) ? "rgba(110,231,255,0.15)" : "transparent", borderColor: selected.includes(p.id) ? "#6ee7ff" : "rgba(255,255,255,0.1)" }} onClick={() => setSelected(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}>
                {hungarianLabels[p.name] || p.name}
              </button>
            ))}
          </div>
        </div>
        {err && <p style={{ color: "crimson", textAlign: "center" }}>{err}</p>}
        <button className="btn btn-primary" type="submit" style={{ padding: "16px", fontSize: "1.2rem", fontWeight: 900 }}>Fiók létrehozása</button>
      </form>
    </div>
  );
}
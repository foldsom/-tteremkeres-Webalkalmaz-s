import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../store/auth";
import { listPreferences } from "../api/preferences";

export default function Register() {
  const { doRegister } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", preferenceIds: [] });
  const [err, setErr] = useState("");

  const { data: preferences } = useQuery({ queryKey: ["preferences"], queryFn: listPreferences });

  function togglePreference(id) {
    setForm((prev) => ({
      ...prev,
      preferenceIds: prev.preferenceIds.includes(id)
        ? prev.preferenceIds.filter((x) => x !== id)
        : [...prev.preferenceIds, id],
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await doRegister(form);
      nav("/login");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 620 }}>
      <div className="card card-pad">
        <h1 style={{ marginTop: 0 }}>Regisztráció</h1>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            className="input"
            placeholder="Felhasználónév"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Jelszó (min. 8, nagybetű/szám/speciális karakter)"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <div>
            <div style={{ marginBottom: 8, color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>Preferenciák</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(preferences ?? []).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="btn"
                  onClick={() => togglePreference(p.id)}
                  style={{
                    borderColor: form.preferenceIds.includes(p.id)
                      ? "rgba(110,231,255,0.45)"
                      : "rgba(255,255,255,0.10)",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {err && <p style={{ color: "#fda4af", margin: 0 }}>{err}</p>}
          <button className="btn btn-primary" type="submit">
            Fiók létrehozása
          </button>
        </form>
      </div>
    </div>
  );
}

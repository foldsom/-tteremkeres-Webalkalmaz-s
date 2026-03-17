import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../store/useAuth";
import { listPreferences } from "../api/preferences";

export default function Register() {
  const { doRegister } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [selected, setSelected] = useState([]);
  const [err, setErr] = useState("");

  const {
    data: preferences = [],
    isLoading: prefsLoading,
    error: prefsError,
  } = useQuery({ queryKey: ["preferences"], queryFn: listPreferences });

  const grouped = useMemo(() => {
    const byGroup = { Cuisine: [], Price: [] };
    preferences.forEach((p) => {
      if (p.name.startsWith("Cuisine:")) byGroup.Cuisine.push(p);
      else if (p.name.startsWith("Price:")) byGroup.Price.push(p);
    });
    return byGroup;
  }, [preferences]);

  function togglePreference(id) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await doRegister({ email: form.email, password: form.password, preferenceIds: selected });
      nav("/login");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <h1>Regisztráció</h1>
      <form onSubmit={onSubmit} className="card card-pad" style={{ display: "grid", gap: 14 }}>
        <input
          className="input"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input"
          placeholder="Jelszó (min. 8, nagybetű, szám, speciális karakter)"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {prefsLoading && <p className="p">Preferenciák betöltése…</p>}
        {prefsError && <p style={{ color: "crimson" }}>Nem sikerült betölteni a preferenciákat.</p>}

        {!prefsLoading && !prefsError && (
          <>
            <div>
              <strong>Konyha preferenciák</strong>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {grouped.Cuisine.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className="btn"
                    style={{ borderColor: selected.includes(p.id) ? "rgba(110,231,255,0.6)" : undefined }}
                    onClick={() => togglePreference(p.id)}
                  >
                    {p.name.replace("Cuisine:", "")}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <strong>Árkategória preferenciák</strong>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {grouped.Price.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    className="btn"
                    style={{ borderColor: selected.includes(p.id) ? "rgba(110,231,255,0.6)" : undefined }}
                    onClick={() => togglePreference(p.id)}
                  >
                    {p.name.replace("Price:", "$")}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {err && <p style={{ color: "crimson" }}>{err}</p>}
        <button className="btn btn-primary" type="submit" disabled={prefsLoading}>
          Fiók létrehozása
        </button>
      </form>
    </div>
  );
}

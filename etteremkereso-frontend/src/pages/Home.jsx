import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <h1>Étteremkereső</h1>
      <p>Keress éttermeket és mentsd kedvencekbe.</p>
      <Link to="/restaurants">→ Éttermek</Link>
    </div>
  );
}

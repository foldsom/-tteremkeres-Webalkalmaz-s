import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listRestaurants } from "../api/restaurants";

export default function Restaurants() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => listRestaurants(),
  });

  if (isLoading) return <p>Betöltés...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error.message}</p>;

  const restaurants = Array.isArray(data) ? data : data?.items || [];

  return (
    <div>
      <h1>Éttermek</h1>
      <ul>
        {restaurants.map((r) => (
          <li key={r.id}>
            <Link to={`/restaurants/${r.id}`}>{r.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

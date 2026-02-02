import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRestaurant } from "../api/restaurants";

export default function RestaurantDetail() {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => getRestaurant(id),
  });

  if (isLoading) return <p>Betöltés...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error.message}</p>;
  if (!data) return <p>Nincs adat.</p>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <p><strong>Cím:</strong> {data.address}</p>
    </div>
  );
}

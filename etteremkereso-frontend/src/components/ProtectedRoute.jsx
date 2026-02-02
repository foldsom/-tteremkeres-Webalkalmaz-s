import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function ProtectedRoute({ children }) {
  const { isAuthed, booting } = useAuth();
  if (booting) return <p>Betöltés...</p>;
  return isAuthed ? children : <Navigate to="/login" replace />;
}

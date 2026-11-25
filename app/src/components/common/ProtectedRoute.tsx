import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="mx-auto max-w-6xl px-6 pt-32 text-foreground/50">Checking your session…</p>;
  }

  if (!isAuthenticated) {
    // Remember where they were going so login can send them straight back.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}

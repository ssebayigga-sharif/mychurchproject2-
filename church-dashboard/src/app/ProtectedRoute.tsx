import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8faf9", color: "#2d6a4f" }}>
        <h2>Loading secure session...</h2>
      </div>
    );
  }

  // If there's no user session, boot them to the login screen
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes (e.g. Dashboard, Members)
  return <Outlet />;
};

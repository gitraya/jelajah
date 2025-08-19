import { Navigate, useLocation } from "react-router-dom";

import Layout from "@/components/layouts/Layout";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <span>Loading authentication status...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }

  return <Layout />;
}

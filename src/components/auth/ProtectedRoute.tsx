import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  // El alumno entró con la contraseña temporal que le pasó el coach: hasta que
  // no elija una propia no puede usar la app. /update-password queda fuera de
  // ProtectedRoute, así que no hay ciclo de redirecciones.
  if (user?.user_metadata?.must_change_password) {
    return <Navigate to="/update-password" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

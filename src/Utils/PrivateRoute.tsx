import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./Hooks/AuthProvider";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

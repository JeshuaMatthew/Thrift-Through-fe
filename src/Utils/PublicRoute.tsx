import { Navigate } from "react-router-dom";
import type{ ReactNode } from "react";
import { useAuth } from "./Hooks/AuthProvider";

const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/map" /> : children;
};

export default PublicRoute;

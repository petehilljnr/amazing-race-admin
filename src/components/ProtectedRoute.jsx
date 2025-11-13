import React from "react";
import { useAuth } from "../contexts/AuthContext";
import Auth from "../pages/Auth";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  return currentUser ? children : <Auth />;
};

export default ProtectedRoute;
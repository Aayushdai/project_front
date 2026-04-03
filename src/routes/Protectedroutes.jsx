import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.kyc_status !== "verified") {
    return <Navigate to="/kyc" replace />;
  }

  return children;
}
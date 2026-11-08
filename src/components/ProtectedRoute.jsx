import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";

// UX feature, NOT security: it only hides the page in the browser.
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Remember where the user wanted to go, so Login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

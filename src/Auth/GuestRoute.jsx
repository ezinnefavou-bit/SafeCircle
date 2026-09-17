import { Navigate } from "react-router";
import { useAuth } from "./AuthContext";

// Inverse of ProtectedRoute: for pages that should only be visible to signed-out
// visitors (login, register). If a session is already active, send the user
// straight to their dashboard instead of letting them see the auth forms again.
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Checking your session…
      </div>
    );
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

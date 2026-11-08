import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { login } from "../api/authApi.js";

export default function Login() {
  const { user, logIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Page the user originally tried to open (set by ProtectedRoute), or "/".
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search ?? ""}` : "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (user) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const loggedInUser = await login(username, password);
      logIn(loggedInUser);
      // replace: the login page is NOT left in the browser history.
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <section className="login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username (student e-mail)
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        {error && <p className="status error">{error}</p>}
      </form>
    </section>
  );
}

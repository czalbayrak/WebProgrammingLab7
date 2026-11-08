import { NavLink, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import { useCartStore, selectItemCount } from "../store/cartStore.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";

// Separate component so ONLY this badge re-renders when the item count changes.
// selectItemCount returns a number (primitive), so changes that do not affect
// the count (e.g. same count after a re-order) do not re-render it.
function CartBadge() {
  const count = useCartStore(selectItemCount);
  return <span className="badge">{count}</span>;
}

const navClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

export default function Layout() {
  const { user, logOut } = useAuth();
  const [theme, setTheme] = useLocalStorage("theme", "light");

  const toggleTheme = () =>
    setTheme((current) => (current === "light" ? "dark" : "light"));

  return (
    <div className={`app theme-${theme}`}>
      <header className="navbar">
        <nav className="nav-links">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={navClass}>
            Products
          </NavLink>
          <NavLink to="/cart" className={navClass}>
            Cart <CartBadge />
          </NavLink>
        </nav>

        <div className="nav-right">
          <button type="button" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>

          {user ? (
            <>
              <span className="username">{user.username}</span>
              <button type="button" onClick={logOut}>
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navClass}>
              Login
            </NavLink>
          )}
        </div>
      </header>

      <main className="content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>Mini Shop — Web Programming Assignment 7</p>
      </footer>
    </div>
  );
}

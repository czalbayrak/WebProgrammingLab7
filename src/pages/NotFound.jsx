import { Link, useLocation } from "react-router";

export default function NotFound() {
  const location = useLocation();
  return (
    <section>
      <h1>404 — Page not found</h1>
      <p>
        There is no page at <code>{location.pathname}</code>.
      </p>
      <Link to="/">← Back to home</Link>
    </section>
  );
}

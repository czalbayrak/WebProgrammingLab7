import { Link } from "react-router";

export default function Home() {
  return (
    <section>
      <h1>Welcome to Mini Shop</h1>
      <p>Browse our catalogue, filter products and share the filtered view by link.</p>
      <p>
        <Link to="/products">Go to products →</Link>
      </p>
    </section>
  );
}

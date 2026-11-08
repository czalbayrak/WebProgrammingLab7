import { useSearchParams } from "react-router";
import { useFetch } from "../hooks/useFetch.js";
import { fetchProducts } from "../api/productsApi.js";
import ProductCard from "../components/ProductCard.jsx";

export default function ProductList() {
  const { loading, error, data: products } = useFetch(
    (signal) => fetchProducts(signal),
    []
  );

  // Filter values live in the URL query string: /products?category=beauty&q=mascara
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "";

  // Update ONE parameter without losing the others: copy the current params,
  // change only the one we need, and delete it when it is empty.
  function updateParam(name, value) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(name, value);
        else next.delete(name);
        return next;
      },
      { replace: true }
    );
  }

  if (loading) return <p className="status">Loading products…</p>;
  if (error) return <p className="status error">Error: {error.message}</p>;

  // Derived during render — not stored in state, not computed in an effect.
  const categories = [...new Set(products.map((p) => p.category))].sort();
  const search = q.trim().toLowerCase();
  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search) &&
      (category === "" || p.category === category)
  );

  return (
    <section>
      <h1>Products</h1>

      <div className="filters">
        <input
          type="search"
          placeholder="Search by title…"
          value={q}
          onChange={(e) => updateParam("q", e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        {(q || category) && (
          <button type="button" onClick={() => setSearchParams({}, { replace: true })}>
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="status">No products match your filters.</p>
      ) : (
        <>
          <p className="muted">{filtered.length} product(s)</p>
          <div className="grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

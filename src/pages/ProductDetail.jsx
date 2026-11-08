import { Link, useNavigate, useParams } from "react-router";
import { useFetch } from "../hooks/useFetch.js";
import { fetchProduct } from "../api/productsApi.js";
import { useCartStore, selectAddItem } from "../store/cartStore.js";

export default function ProductDetail() {
  // useParams always returns STRINGS: id is "3", not 3.
  const { id } = useParams();
  const navigate = useNavigate();

  // Only the action is selected, so this component never re-renders on cart changes.
  const addItem = useCartStore(selectAddItem);

  // `id` is in the dependency list: changing the URL from /products/3 to
  // /products/4 cancels the old request and loads the new product.
  const { loading, error, data: product } = useFetch(
    (signal) => fetchProduct(id, signal),
    [id]
  );

  const numericId = Number(id);
  const nextId = Number.isInteger(numericId) ? numericId + 1 : 1;

  return (
    <section>
      <button type="button" onClick={() => navigate("/products")}>
        ← Back to products
      </button>

      {loading && <p className="status">Loading product…</p>}

      {error && (
        <div className="status error">
          {error.status === 404 ? (
            <p>Product not found. There is no product with id “{id}”.</p>
          ) : (
            <p>Could not load the product: {error.message}</p>
          )}
        </div>
      )}

      {product && (
        <article className="detail">
          <img src={product.thumbnail} alt={product.title} />
          <div>
            <h1>{product.title}</h1>
            <p className="category">Category: {product.category}</p>
            <p>{product.description}</p>
            <p className="price">${product.price.toFixed(2)}</p>
            <button type="button" onClick={() => addItem(product)}>
              Add to cart
            </button>
          </div>
        </article>
      )}

      <p>
        <Link to={`/products/${nextId}`}>Next product →</Link>
      </p>
    </section>
  );
}

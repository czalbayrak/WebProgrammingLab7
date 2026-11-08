import { Link } from "react-router";

export default function ProductCard({ product }) {
  return (
    <article className="card">
      <Link to={`/products/${product.id}`}>
        <img src={product.thumbnail} alt={product.title} />
        <h3>{product.title}</h3>
      </Link>
      <p className="category">{product.category}</p>
      <p className="price">${product.price.toFixed(2)}</p>
    </article>
  );
}

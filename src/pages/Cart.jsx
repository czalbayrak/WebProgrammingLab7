import { Link } from "react-router";
import {
  useCartStore,
  selectItems,
  selectTotalPrice,
  selectRemoveItem,
  selectSetQuantity,
  selectClear,
} from "../store/cartStore.js";

export default function Cart() {
  const items = useCartStore(selectItems); // existing reference
  const total = useCartStore(selectTotalPrice); // primitive (derived)
  const removeItem = useCartStore(selectRemoveItem);
  const setQuantity = useCartStore(selectSetQuantity);
  const clear = useCartStore(selectClear);

  if (items.length === 0) {
    return (
      <section>
        <h1>Your cart</h1>
        <p className="status">Your cart is empty.</p>
        <Link to="/products">Browse products →</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Your cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <Link to={`/products/${item.id}`}>{item.title}</Link>
              </td>
              <td>${item.price.toFixed(2)}</td>
              <td>
                <button type="button" onClick={() => setQuantity(item.id, item.quantity - 1)}>
                  −
                </button>
                <span className="qty">{item.quantity}</span>
                <button type="button" onClick={() => setQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
              </td>
              <td>${(item.price * item.quantity).toFixed(2)}</td>
              <td>
                <button type="button" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="total">Total: ${total.toFixed(2)}</p>
      <button type="button" onClick={clear}>
        Clear cart
      </button>
    </section>
  );
}

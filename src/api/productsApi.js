// API layer: plain JavaScript only (no JSX, no React imports).

const BASE_URL = "https://dummyjson.com/products";

// fetch() only rejects on network failure, NOT on HTTP error statuses (404, 500...).
// So we check response.ok ourselves and throw an Error that also carries the status.
async function request(url, signal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    const error = new Error(
      response.status === 404
        ? "Product not found"
        : `Request failed with status ${response.status}`
    );
    error.status = response.status;
    throw error;
  }

  return response.json();
}

// Returns the parsed list of products (the array inside { products, total, skip, limit }).
export async function fetchProducts(signal) {
  const data = await request(`${BASE_URL}?limit=100`, signal);
  return data.products;
}

// Returns one parsed product. `id` comes from the URL, so it is a string.
export async function fetchProduct(id, signal) {
  return request(`${BASE_URL}/${encodeURIComponent(id)}`, signal);
}

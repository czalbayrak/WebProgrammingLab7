# Assignment 7 — Mini Shop (React Router, Context, Zustand)

A small online shop built with React + Vite. It loads products from the public DummyJSON API, lets visitors filter the catalogue through the URL, shows a detail page per product, keeps a persistent cart, protects the cart page behind a (simulated) login, and remembers the theme between visits.

## How to run

```bash
npm install
npm run dev
```

Open the address printed in the terminal (usually http://localhost:5173).

**Demo account**

| Username | Password |
|---|---|
| `230408025@student.edu.tr` | `demo123456` |

## Project structure

```
src/
  api/
    productsApi.js      fetchProducts(signal), fetchProduct(id, signal) — no React
    authApi.js          login(username, password) — simulated 500 ms server call
  hooks/
    useFetch.js         loading / error / data with useReducer + AbortController
    useLocalStorage.js  useState-shaped hook backed by localStorage
  context/
    AuthContext.jsx     AuthProvider + useAuth (reducer: LOGGED_IN / LOGGED_OUT)
  store/
    cartStore.js        Zustand cart store + selectors + localStorage subscription
  components/
    Layout.jsx          navbar (NavLink, cart badge, theme toggle, login/logout) + Outlet + footer
    ProductCard.jsx
    ProtectedRoute.jsx
  pages/
    Home.jsx
    ProductList.jsx     filters in the query string (useSearchParams)
    ProductDetail.jsx   id from useParams, Back + Next product
    Cart.jsx
    Login.jsx
    NotFound.jsx
  App.jsx               route configuration
  main.jsx              BrowserRouter + AuthProvider
  index.css             minimal styles, light/dark theme classes
```

## Routes

| Path | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/products` | ProductList | Public |
| `/products/:id` | ProductDetail | Public |
| `/cart` | Cart | Signed-in users only |
| `/login` | Login | Public |
| `*` | NotFound | Public |

All pages render inside `Layout` through `<Outlet />`. `/products` and `/products/:id` are nested routes (an index route and a `:id` route under one `products` parent).

---

## Reasoning questions

### 1. State choices

- **Signed-in user** — lives in `AuthContext` (Context + `useReducer`). It is global, changes rarely (only on login/logout) and is read by the navbar, `ProtectedRoute` and `Login`, so a single provider at the top of the tree is the simplest fit.
- **Cart** — lives in a Zustand store (`cartStore.js`). It changes often and is read by several components that each need a different slice (badge count, item list, total), so selectors let each component re-render only when its own slice changes. It is persisted to localStorage through `subscribe`.
- **Filter values** — live in the URL query string (`?q=…&category=…`), read with `useSearchParams`. This makes the filtered view shareable by link and survive refreshes; the filtered list itself is derived during render.
- **Product list** — local state of `ProductList`, held by `useFetch`. It is server data needed by one page only, so there is no reason to make it global.
- **Theme** — lives in `Layout` via `useLocalStorage("theme")`. Only the layout wrapper needs it (it sets the `theme-light` / `theme-dark` class), and the hook persists it across reloads.

### 2. Context versus store

The user changes very rarely and almost every consumer needs the whole value, so Context's behaviour (every consumer re-renders when the value changes) costs nothing. The cart changes on every click; with Context, every component reading the cart — including ones that only need an action like `addItem` — would re-render on each change, because Context cannot subscribe to a part of its value. Zustand selectors solve that: the navbar badge only re-renders when the count number changes, and `ProductDetail` (which only selects `addItem`) never re-renders because of the cart. Swapping them would work for the user (just with an extra library for little gain), but putting the cart in Context would cause many unnecessary re-renders and would require splitting into several contexts to stay efficient.

### 3. Custom hooks

`useFetch` shares the **logic**: the loading/error/data reducer, starting a request when the inputs change, ignoring `AbortError` and cancelling the in-flight request in the cleanup function. It deliberately does **not** share **state**: every call to the hook creates its own `useReducer`, so `ProductList` and `ProductDetail` each have their own independent loading/error/data. It also does not know what is fetched — the fetching function and its dependency list are passed in by the caller.

### 4. Route parameters

`useParams()` always returns strings, so `id` is `"3"`, not `3`. This mattered in two places: in the "Next product" link I convert it with `Number(id)` before adding 1 (otherwise `"3" + 1` would be `"31"`), and when comparing ids — the cart stores the numeric `product.id` from the API response, not the URL string, so `addItem` / `removeItem` compare numbers with numbers. For the API call the string is fine because it is just inserted into the URL.

### 5. Protected routes

`ProtectedRoute` only decides what the browser **shows**; all the code and data are already on the client. Anyone can open the dev tools, change the state or edit the JavaScript, and in this app the "server" check itself (`authApi.js`) runs in the browser with the password in the bundle. Real security needs a backend: the server verifies the credentials, issues a session cookie or token (e.g. a signed JWT in an HttpOnly cookie), and **every protected API endpoint checks that token** before returning data. The client-side redirect then becomes only a convenience on top of that.

### 6. Deep links

A plain static file server looks for a real file at the requested path, so reloading `/products/3` would return **404**, because there is no `products/3/index.html` file — only `index.html` at the root. Routing happens in JavaScript after `index.html` loads, so the server has to be configured to return `index.html` for all unknown paths (an "SPA fallback" / rewrite rule, e.g. `_redirects` on Netlify, `try_files $uri /index.html` on nginx). The Vite development server already has this history-API fallback built in: for any path that is not a file it serves `index.html`, and React Router then reads the URL and renders the right page.

---

## Self-study (research)

**Updating one query-string parameter without losing the others.** From the React Router docs I found that the setter from `useSearchParams` accepts a function that receives the current `URLSearchParams` (like a `setState` updater), and the MDN docs for `URLSearchParams` show `set()` and `delete()`. In `ProductList.jsx` I copy the current params with `new URLSearchParams(prev)`, change only the one parameter, delete it when empty (so the URL stays clean), and return the new object. That way changing the category keeps the search text and vice versa. I also pass `{ replace: true }` so typing in the search box does not create a new history entry for every keystroke.

**Remembering the original page after login.** The React Router docs show that `<Navigate>` and `navigate()` accept a `state` object and a `replace` option. `ProtectedRoute` redirects with `state={{ from: location }}`; `Login` reads `location.state?.from` and, after a successful login, calls `navigate(redirectTo, { replace: true })`, so the login page is replaced in the history and the Back button does not return to it.

**Persisting a Zustand store from outside React.** The Zustand docs describe `store.subscribe((state, prevState) => …)`, which runs on every change without any component. In `cartStore.js` I subscribe once at module level and write to localStorage only when `state.items !== prevState.items`. Because all updates are immutable, a new array reference means the items really changed. The initial state is read from localStorage when the store is created.

**Selectors and re-renders.** The Zustand docs explain that a component re-renders when its selector's result changes (compared with `Object.is`). That is why my selectors return either primitives (`selectItemCount`, `selectTotalPrice` return numbers) or existing references (`selectItems`, action selectors). A selector that built a new object or array each time would re-render on every store change (and in Zustand v5 can even cause an infinite loop). The count is shown by a small `CartBadge` component so only the badge re-renders when it changes.

**Treating HTTP errors as errors.** MDN's `fetch()` page explains that the promise only rejects on network errors, not on 404 or 500. `productsApi.js` checks `response.ok` and throws an `Error` with a `status` property, so `ProductDetail` can show "Product not found" for `/products/999999`.

## Notes

- No Redux, no React Query/SWR and no UI libraries are used.
- Client-side protection is a user-experience feature, **not security** (see question 5).

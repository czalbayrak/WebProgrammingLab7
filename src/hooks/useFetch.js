import { useEffect, useReducer } from "react";

const initialState = { loading: true, error: null, data: null };

function fetchReducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { loading: true, error: null, data: null };
    case "FETCH_SUCCESS":
      return { loading: false, error: null, data: action.payload };
    case "FETCH_ERROR":
      return { loading: false, error: action.payload, data: null };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

/**
 * useFetch(fetchFn, deps)
 * - fetchFn: (signal) => Promise<data>
 * - deps: list of inputs the request depends on (e.g. [id])
 * Returns { loading, error, data }.
 *
 * Every component that calls useFetch gets its OWN state; nothing is shared.
 */
export function useFetch(fetchFn, deps) {
  const [state, dispatch] = useReducer(fetchReducer, initialState);

  useEffect(() => {
    const controller = new AbortController();
    dispatch({ type: "FETCH_START" });

    fetchFn(controller.signal)
      .then((data) => dispatch({ type: "FETCH_SUCCESS", payload: data }))
      .catch((error) => {
        // An aborted request is not an error: the component moved on.
        if (error.name === "AbortError") return;
        dispatch({ type: "FETCH_ERROR", payload: error });
      });

    // Cleanup: cancel the in-flight request when deps change or on unmount.
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}

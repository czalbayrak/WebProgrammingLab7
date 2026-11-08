import { useEffect, useState } from "react";

/**
 * Same call shape as useState: const [value, setValue] = useLocalStorage(key, initial)
 * - reads the initial value from localStorage (lazy initialiser, runs once)
 * - writes the value back whenever it changes
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or blocked: keep working in memory
    }
  }, [key, value]);

  return [value, setValue];
}

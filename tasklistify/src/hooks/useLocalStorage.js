import { useEffect, useState } from "react";

/**
 * useState that transparently persists to localStorage.
 *
 * Behaves like useState, but reads the initial value from localStorage (falling
 * back to `initialValue`) and writes back whenever the value changes.
 *
 * @param {string} key            localStorage key
 * @param {*}      initialValue    value used when nothing is stored yet
 * @param {object} [options]
 * @param {boolean} [options.raw=false]  store as a plain string instead of JSON
 *        (use for values that were historically saved without JSON.stringify)
 */
export default function useLocalStorage(key, initialValue, { raw = false } = {}) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return initialValue;
      return raw ? stored : JSON.parse(stored);
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, raw ? value : JSON.stringify(value));
    } catch {
      // Ignore write failures (e.g. storage disabled or quota exceeded).
    }
  }, [key, value, raw]);

  return [value, setValue];
}

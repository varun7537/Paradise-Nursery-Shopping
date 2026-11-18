// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of `value` that only updates
 * after `delay` ms of inactivity.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchQuery, 500);
 *   useEffect(() => { loadUsers(1); }, [debouncedSearch]);
 */
const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
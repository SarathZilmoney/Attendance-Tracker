/**
 * Hook for managing user ID (UUID-based invisible login)
 */

import { useState, useEffect } from 'react';
import { getUserId } from '../utils/uuid';

/**
 * Custom hook that returns the user's UUID
 * Creates a new UUID if one doesn't exist in localStorage
 * @returns {string|null} User UUID or null while loading
 */
export function useUserId() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get or generate user ID on mount
    const id = getUserId();
    setUserId(id);
  }, []);

  return userId;
}

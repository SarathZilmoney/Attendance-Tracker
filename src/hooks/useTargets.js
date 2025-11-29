/**
 * Hook for managing monthly targets
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchMonthlyTarget, upsertMonthlyTarget } from '../services/supabase';

/**
 * Custom hook for monthly target management
 * @param {string} userId - User UUID
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {Object} Target state and operations
 */
export function useTargets(userId, monthYear) {
  const [target, setTarget] = useState({
    fixed_target: 200,
    custom_target: 200,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch target for the month
  const fetchTarget = useCallback(async () => {
    if (!userId || !monthYear) return;

    try {
      setLoading(true);
      setError(null);
      const data = await fetchMonthlyTarget(userId, monthYear);
      setTarget(data);
    } catch (err) {
      console.error('Error fetching target:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, monthYear]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchTarget();
  }, [fetchTarget]);

  // Update custom target
  const updateCustomTarget = useCallback(
    async (newTarget) => {
      if (!userId || !monthYear) return;

      try {
        setError(null);
        const data = await upsertMonthlyTarget(userId, monthYear, newTarget);
        setTarget(data);
      } catch (err) {
        console.error('Error updating target:', err);
        setError(err.message);
        throw err;
      }
    },
    [userId, monthYear]
  );

  return {
    fixedTarget: target.fixed_target,
    customTarget: target.custom_target,
    loading,
    error,
    updateCustomTarget,
    refetch: fetchTarget,
  };
}

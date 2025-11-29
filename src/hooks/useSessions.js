/**
 * Hook for managing sessions with Supabase
 * Handles CRUD operations and realtime subscriptions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchSessionsByMonth,
  fetchTodaySessions,
  getActiveSession,
  punchIn as doPunchIn,
  punchOut as doPunchOut,
  updateSession as doUpdateSession,
  deleteSession as doDeleteSession,
  subscribeToSessions,
  unsubscribe,
  calculateDailyTotal,
  calculateMonthlyTotal,
} from '../services/supabase';
import { getTodayDateIST, getCurrentMonthYear } from '../utils/time';

/**
 * Custom hook for session management
 * @param {string} userId - User UUID
 * @param {string} selectedMonth - Selected month (YYYY-MM format)
 * @returns {Object} Session state and operations
 */
export function useSessions(userId, selectedMonth) {
  const [sessions, setSessions] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculated values
  const today = getTodayDateIST();
  const dailyTotal = calculateDailyTotal(todaySessions, today);
  const monthlyTotal = calculateMonthlyTotal(sessions, selectedMonth);

  // Fetch sessions for the selected month
  const fetchSessions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const [monthSessions, todayData, active] = await Promise.all([
        fetchSessionsByMonth(userId, selectedMonth),
        fetchTodaySessions(userId),
        getActiveSession(userId),
      ]);

      setSessions(monthSessions);
      setTodaySessions(todayData);
      setActiveSession(active);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedMonth]);

  // Initial fetch and subscription setup
  useEffect(() => {
    if (!userId) return;

    fetchSessions();

    // Subscribe to realtime changes
    const subscription = subscribeToSessions(userId, (payload) => {
      console.log('Realtime update:', payload);
      // Refetch all data on any change
      fetchSessions();
    });

    return () => {
      unsubscribe(subscription);
    };
  }, [userId, fetchSessions]);

  // Punch in operation
  const punchIn = useCallback(async () => {
    if (!userId || activeSession) return;

    try {
      setError(null);
      const newSession = await doPunchIn(userId);
      setActiveSession(newSession);
      // Refetch to update lists
      await fetchSessions();
    } catch (err) {
      console.error('Error punching in:', err);
      setError(err.message);
      throw err;
    }
  }, [userId, activeSession, fetchSessions]);

  // Punch out operation
  const punchOut = useCallback(async () => {
    if (!userId || !activeSession) return;

    try {
      setError(null);
      await doPunchOut(activeSession.id, activeSession.punch_in);
      setActiveSession(null);
      // Refetch to update lists
      await fetchSessions();
    } catch (err) {
      console.error('Error punching out:', err);
      setError(err.message);
      throw err;
    }
  }, [userId, activeSession, fetchSessions]);

  // Update session operation
  const updateSession = useCallback(
    async (sessionId, punchInTime, punchOutTime) => {
      try {
        setError(null);
        await doUpdateSession(sessionId, punchInTime, punchOutTime);
        await fetchSessions();
      } catch (err) {
        console.error('Error updating session:', err);
        setError(err.message);
        throw err;
      }
    },
    [fetchSessions]
  );

  // Delete session operation
  const deleteSession = useCallback(
    async (sessionId) => {
      try {
        setError(null);
        await doDeleteSession(sessionId);
        // Clear active session if it was deleted
        if (activeSession?.id === sessionId) {
          setActiveSession(null);
        }
        await fetchSessions();
      } catch (err) {
        console.error('Error deleting session:', err);
        setError(err.message);
        throw err;
      }
    },
    [activeSession, fetchSessions]
  );

  return {
    sessions,
    todaySessions,
    activeSession,
    loading,
    error,
    dailyTotal,
    monthlyTotal,
    punchIn,
    punchOut,
    updateSession,
    deleteSession,
    refetch: fetchSessions,
  };
}

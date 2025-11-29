/**
 * Supabase Client Configuration and Database Operations
 */

import { createClient } from '@supabase/supabase-js';
import {
  getTodayDateIST,
  getNowUTC,
  calculateDurationMinutes,
  getCurrentMonthYear,
} from '../utils/time';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// SESSION OPERATIONS
// ============================================

/**
 * Fetches all sessions for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of session objects
 */
export async function fetchAllSessions(userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('punch_in', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches sessions for a specific month
 * @param {string} userId - User UUID
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {Promise<Array>} Array of session objects
 */
export async function fetchSessionsByMonth(userId, monthYear) {
  const startDate = `${monthYear}-01`;
  const [year, month] = monthYear.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${monthYear}-${lastDay.toString().padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('punch_in', { ascending: true });

  if (error) {
    console.error('Error fetching sessions by month:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetches sessions for today
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} Array of today's sessions
 */
export async function fetchTodaySessions(userId) {
  const today = getTodayDateIST();

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('punch_in', { ascending: true });

  if (error) {
    console.error('Error fetching today sessions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Gets the current active session (punch_out is null)
 * @param {string} userId - User UUID
 * @returns {Promise<Object|null>} Active session or null
 */
export async function getActiveSession(userId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .is('punch_out', null)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = no rows returned
    console.error('Error fetching active session:', error);
    throw error;
  }

  return data || null;
}

/**
 * Creates a new punch-in session
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Created session
 */
export async function punchIn(userId) {
  const now = getNowUTC();
  const today = getTodayDateIST();

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      date: today,
      punch_in: now,
      punch_out: null,
      duration_minutes: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error punching in:', error);
    throw error;
  }

  return data;
}

/**
 * Punches out from the active session
 * @param {string} sessionId - Session UUID
 * @param {string} punchInTime - Original punch-in timestamp
 * @returns {Promise<Object>} Updated session
 */
export async function punchOut(sessionId, punchInTime) {
  const now = getNowUTC();
  const durationMinutes = calculateDurationMinutes(punchInTime, now);

  const { data, error } = await supabase
    .from('sessions')
    .update({
      punch_out: now,
      duration_minutes: durationMinutes,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error punching out:', error);
    throw error;
  }

  return data;
}

/**
 * Updates a session's punch times
 * @param {string} sessionId - Session UUID
 * @param {string} punchIn - New punch-in timestamp
 * @param {string} punchOut - New punch-out timestamp (can be null)
 * @returns {Promise<Object>} Updated session
 */
export async function updateSession(sessionId, punchIn, punchOut) {
  const durationMinutes = punchOut
    ? calculateDurationMinutes(punchIn, punchOut)
    : 0;

  const { data, error } = await supabase
    .from('sessions')
    .update({
      punch_in: punchIn,
      punch_out: punchOut,
      duration_minutes: durationMinutes,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating session:', error);
    throw error;
  }

  return data;
}

/**
 * Deletes a session
 * @param {string} sessionId - Session UUID
 * @returns {Promise<void>}
 */
export async function deleteSession(sessionId) {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);

  if (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

// ============================================
// TARGET OPERATIONS
// ============================================

/**
 * Fetches the monthly target for a user
 * @param {string} userId - User UUID
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {Promise<Object>} Target object
 */
export async function fetchMonthlyTarget(userId, monthYear) {
  const { data, error } = await supabase
    .from('monthly_targets')
    .select('*')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching monthly target:', error);
    throw error;
  }

  // If no target exists, return default values
  if (!data) {
    return {
      user_id: userId,
      month_year: monthYear,
      fixed_target: 200,
      custom_target: 200,
    };
  }

  return data;
}

/**
 * Creates or updates a monthly target
 * @param {string} userId - User UUID
 * @param {string} monthYear - Month in YYYY-MM format
 * @param {number} customTarget - Custom target hours
 * @returns {Promise<Object>} Created/updated target
 */
export async function upsertMonthlyTarget(userId, monthYear, customTarget) {
  const { data, error } = await supabase
    .from('monthly_targets')
    .upsert(
      {
        user_id: userId,
        month_year: monthYear,
        fixed_target: 200,
        custom_target: customTarget,
      },
      {
        onConflict: 'user_id,month_year',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error upserting monthly target:', error);
    throw error;
  }

  return data;
}

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

/**
 * Subscribes to session changes for a user
 * @param {string} userId - User UUID
 * @param {Function} callback - Callback function for changes
 * @returns {Object} Subscription object (call .unsubscribe() to stop)
 */
export function subscribeToSessions(userId, callback) {
  const subscription = supabase
    .channel(`sessions-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Unsubscribes from a channel
 * @param {Object} subscription - Subscription object
 */
export function unsubscribe(subscription) {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
}

// ============================================
// STATISTICS
// ============================================

/**
 * Calculates total worked minutes for a given date
 * @param {Array} sessions - Array of sessions
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {number} Total minutes
 */
export function calculateDailyTotal(sessions, date) {
  return sessions
    .filter((s) => s.date === date)
    .reduce((total, s) => total + (s.duration_minutes || 0), 0);
}

/**
 * Calculates total worked minutes for a given month
 * @param {Array} sessions - Array of sessions
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {number} Total minutes
 */
export function calculateMonthlyTotal(sessions, monthYear) {
  return sessions
    .filter((s) => s.date && s.date.startsWith(monthYear))
    .reduce((total, s) => total + (s.duration_minutes || 0), 0);
}

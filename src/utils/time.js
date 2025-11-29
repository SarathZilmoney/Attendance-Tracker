/**
 * Time utilities for IST (Asia/Kolkata) timezone handling
 * All timestamps are stored as UTC in Supabase but displayed in IST
 */

import { format, parseISO, differenceInMinutes, differenceInSeconds, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Gets the current time in IST as a Date object
 * @returns {Date} Current time in IST
 */
export function getNowIST() {
  return toZonedTime(new Date(), IST_TIMEZONE);
}

/**
 * Gets the current date string in IST (YYYY-MM-DD)
 * @returns {string} Current date in YYYY-MM-DD format
 */
export function getTodayDateIST() {
  return formatInTimeZone(new Date(), IST_TIMEZONE, 'yyyy-MM-dd');
}

/**
 * Gets the current month-year string in IST (YYYY-MM)
 * @returns {string} Current month in YYYY-MM format
 */
export function getCurrentMonthYear() {
  return formatInTimeZone(new Date(), IST_TIMEZONE, 'yyyy-MM');
}

/**
 * Converts a UTC timestamp to IST for display
 * @param {string|Date} utcTimestamp - UTC timestamp
 * @returns {Date} Date in IST
 */
export function utcToIST(utcTimestamp) {
  if (!utcTimestamp) return null;
  const date = typeof utcTimestamp === 'string' ? parseISO(utcTimestamp) : utcTimestamp;
  return toZonedTime(date, IST_TIMEZONE);
}

/**
 * Converts IST time to UTC for storage
 * @param {Date} istDate - Date in IST
 * @returns {Date} Date in UTC
 */
export function istToUTC(istDate) {
  return fromZonedTime(istDate, IST_TIMEZONE);
}

/**
 * Gets the current UTC timestamp as ISO string
 * @returns {string} Current UTC timestamp
 */
export function getNowUTC() {
  return new Date().toISOString();
}

/**
 * Formats a timestamp for display in IST
 * @param {string|Date} timestamp - UTC timestamp
 * @param {string} formatStr - date-fns format string
 * @returns {string} Formatted time string
 */
export function formatTimeIST(timestamp, formatStr = 'HH:mm:ss') {
  if (!timestamp) return '-';
  return formatInTimeZone(
    typeof timestamp === 'string' ? parseISO(timestamp) : timestamp,
    IST_TIMEZONE,
    formatStr
  );
}

/**
 * Formats a timestamp for display with date and time in IST
 * @param {string|Date} timestamp - UTC timestamp
 * @returns {string} Formatted datetime string
 */
export function formatDateTimeIST(timestamp) {
  if (!timestamp) return '-';
  return formatInTimeZone(
    typeof timestamp === 'string' ? parseISO(timestamp) : timestamp,
    IST_TIMEZONE,
    'dd MMM yyyy, HH:mm'
  );
}

/**
 * Formats a date for display in IST
 * @param {string|Date} timestamp - UTC timestamp or date string
 * @returns {string} Formatted date string
 */
export function formatDateIST(timestamp) {
  if (!timestamp) return '-';
  return formatInTimeZone(
    typeof timestamp === 'string' ? parseISO(timestamp) : timestamp,
    IST_TIMEZONE,
    'dd MMM yyyy'
  );
}

/**
 * Calculates duration in minutes between two timestamps
 * @param {string|Date} start - Start timestamp (UTC)
 * @param {string|Date} end - End timestamp (UTC)
 * @returns {number} Duration in minutes
 */
export function calculateDurationMinutes(start, end) {
  if (!start || !end) return 0;
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return Math.round(differenceInMinutes(endDate, startDate));
}

/**
 * Calculates elapsed seconds from a start timestamp to now
 * @param {string|Date} start - Start timestamp (UTC)
 * @returns {number} Elapsed seconds
 */
export function calculateElapsedSeconds(start) {
  if (!start) return 0;
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  return differenceInSeconds(new Date(), startDate);
}

/**
 * Formats duration in minutes to HH:MM format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration string
 */
export function formatDuration(minutes) {
  if (minutes === null || minutes === undefined || minutes < 0) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hours}h ${mins}m`;
}

/**
 * Formats seconds to HH:MM:SS format
 * @param {number} totalSeconds - Total seconds
 * @returns {string} Formatted time string
 */
export function formatSecondsToHHMMSS(totalSeconds) {
  if (totalSeconds < 0) totalSeconds = 0;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
}

/**
 * Gets start of month in IST as UTC timestamp
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {string} ISO timestamp of month start
 */
export function getMonthStartUTC(monthYear) {
  const [year, month] = monthYear.split('-').map(Number);
  const istDate = new Date(year, month - 1, 1, 0, 0, 0);
  return fromZonedTime(istDate, IST_TIMEZONE).toISOString();
}

/**
 * Gets end of month in IST as UTC timestamp
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {string} ISO timestamp of month end
 */
export function getMonthEndUTC(monthYear) {
  const [year, month] = monthYear.split('-').map(Number);
  // Get last day of month
  const lastDay = new Date(year, month, 0).getDate();
  const istDate = new Date(year, month - 1, lastDay, 23, 59, 59);
  return fromZonedTime(istDate, IST_TIMEZONE).toISOString();
}

/**
 * Parses a time string (HH:MM) and combines with a date
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 * @param {string} timeStr - Time string (HH:MM)
 * @returns {string} UTC ISO timestamp
 */
export function parseTimeForDate(dateStr, timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const [year, month, day] = dateStr.split('-').map(Number);
  const istDate = new Date(year, month - 1, day, hours, minutes, 0);
  return fromZonedTime(istDate, IST_TIMEZONE).toISOString();
}

/**
 * Validates that end time is after start time
 * @param {string|Date} start - Start timestamp
 * @param {string|Date} end - End timestamp
 * @returns {boolean} True if end is after start
 */
export function isEndAfterStart(start, end) {
  const startDate = typeof start === 'string' ? parseISO(start) : start;
  const endDate = typeof end === 'string' ? parseISO(end) : end;
  return endDate > startDate;
}

/**
 * Gets the date portion from a timestamp in IST
 * @param {string|Date} timestamp - UTC timestamp
 * @returns {string} Date in YYYY-MM-DD format
 */
export function getDateFromTimestamp(timestamp) {
  if (!timestamp) return null;
  return formatInTimeZone(
    typeof timestamp === 'string' ? parseISO(timestamp) : timestamp,
    IST_TIMEZONE,
    'yyyy-MM-dd'
  );
}

/**
 * Gets month-year from a date string or timestamp
 * @param {string} dateStr - Date string (YYYY-MM-DD) or timestamp
 * @returns {string} Month in YYYY-MM format
 */
export function getMonthYearFromDate(dateStr) {
  if (!dateStr) return getCurrentMonthYear();
  // If it's a full date string (YYYY-MM-DD)
  if (dateStr.length === 10) {
    return dateStr.substring(0, 7);
  }
  // If it's a timestamp
  return formatInTimeZone(parseISO(dateStr), IST_TIMEZONE, 'yyyy-MM');
}

/**
 * Formats month-year for display
 * @param {string} monthYear - Month in YYYY-MM format
 * @returns {string} Formatted month (e.g., "November 2025")
 */
export function formatMonthYear(monthYear) {
  const [year, month] = monthYear.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMMM yyyy');
}

/**
 * Gets list of months for selector (last 12 months + next month)
 * @returns {Array<{value: string, label: string}>} Array of month options
 */
export function getMonthOptions() {
  const options = [];
  const now = new Date();

  // Include 12 months back and 1 month ahead
  for (let i = -12; i <= 1; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = format(date, 'yyyy-MM');
    const label = format(date, 'MMMM yyyy');
    options.push({ value, label });
  }

  return options.reverse(); // Most recent first
}

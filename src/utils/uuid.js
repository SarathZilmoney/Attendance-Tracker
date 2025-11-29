/**
 * UUID Generator and Manager
 * Generates RFC4122 v4 compliant UUIDs for user identification
 */

const STORAGE_KEY = 'attendance_user_uuid';

/**
 * Generates a RFC4122 v4 compliant UUID
 * @returns {string} A new UUID string
 */
export function generateUUID() {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Gets the user ID from localStorage, or generates a new one if none exists
 * @returns {string} The user's UUID
 */
export function getUserId() {
  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    userId = generateUUID();
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
}

/**
 * Clears the stored user ID (useful for testing or reset functionality)
 */
export function clearUserId() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Checks if a user ID already exists in localStorage
 * @returns {boolean} True if user ID exists
 */
export function hasUserId() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

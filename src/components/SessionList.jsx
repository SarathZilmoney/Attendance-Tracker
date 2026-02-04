/**
 * List of session cards
 */

import { SessionCard } from './SessionCard';

/**
 * SessionList component
 * @param {Object} props
 * @param {Array} props.sessions - Array of session objects
 * @param {Object} props.activeSession - Current active session
 * @param {Function} props.onEdit - Handler for edit action
 * @param {Function} props.onDelete - Handler for delete action
 * @param {boolean} props.loading - Loading state
 */
export function SessionList({
  sessions,
  activeSession,
  onEdit,
  onDelete,
  loading,
}) {
  if (loading) {
    return (
      <div className="session-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading sessions...</p>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="session-list-empty">
        <div className="empty-icon">📭</div>
        <p>No sessions for this period</p>
        <p className="empty-hint">Punch in to start tracking your time!</p>
      </div>
    );
  }

  // Sort sessions: active first, then by date (descending), then by punch_in (descending)
  const sortedSessions = [...sessions].sort((a, b) => {
    // Active session always first
    if (a.id === activeSession?.id) return -1;
    if (b.id === activeSession?.id) return 1;

    // Then by date descending
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }

    // Then by punch_in descending
    return b.punch_in.localeCompare(a.punch_in);
  });

  return (
    <div className="session-list">
      {sortedSessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          onEdit={onEdit}
          onDelete={onDelete}
          isActive={session.id === activeSession?.id}
        />
      ))}
    </div>
  );
}

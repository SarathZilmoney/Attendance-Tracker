/**
 * Individual session card component
 */

import { formatTimeIST, formatDateIST, formatDuration } from '../utils/time';

/**
 * SessionCard component
 * @param {Object} props
 * @param {Object} props.session - Session data
 * @param {Function} props.onEdit - Handler for edit action
 * @param {Function} props.onDelete - Handler for delete action
 * @param {boolean} props.isActive - Whether this is the active session
 */
export function SessionCard({ session, onEdit, onDelete, isActive }) {
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      onDelete(session.id);
    }
  };

  return (
    <div className={`session-card ${isActive ? 'active' : ''}`}>
      <div className="session-header">
        <span className="session-date">{formatDateIST(session.date)}</span>
        {isActive && <span className="active-badge">Active</span>}
      </div>

      <div className="session-times">
        <div className="time-block">
          <span className="time-label">In</span>
          <span className="time-value">{formatTimeIST(session.punch_in)}</span>
        </div>
        <div className="time-separator">→</div>
        <div className="time-block">
          <span className="time-label">Out</span>
          <span className="time-value">
            {session.punch_out ? formatTimeIST(session.punch_out) : '-'}
          </span>
        </div>
      </div>

      <div className="session-duration">
        <span className="duration-label">Duration:</span>
        <span className="duration-value">
          {isActive ? 'In Progress' : formatDuration(session.duration_minutes)}
        </span>
      </div>

      <div className="session-actions">
        <button
          className="btn-icon btn-edit"
          onClick={() => onEdit(session)}
          aria-label="Edit session"
        >
          ✏️
        </button>
        <button
          className="btn-icon btn-delete"
          onClick={handleDelete}
          aria-label="Delete session"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

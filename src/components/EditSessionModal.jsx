/**
 * Modal for editing session times
 */

import { useState, useEffect } from 'react';
import {
  formatTimeIST,
  parseTimeForDate,
  isEndAfterStart,
  formatDateIST,
} from '../utils/time';

/**
 * EditSessionModal component
 * @param {Object} props
 * @param {Object} props.session - Session to edit
 * @param {Function} props.onSave - Handler for save action
 * @param {Function} props.onClose - Handler for close action
 */
export function EditSessionModal({ session, onSave, onClose }) {
  const [punchInTime, setPunchInTime] = useState('');
  const [punchOutTime, setPunchOutTime] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (session) {
      // Format times for input fields (HH:MM format)
      setPunchInTime(formatTimeIST(session.punch_in, 'HH:mm'));
      setPunchOutTime(
        session.punch_out ? formatTimeIST(session.punch_out, 'HH:mm') : ''
      );
    }
  }, [session]);

  const handleSave = async () => {
    setError('');

    // Validate times
    if (!punchInTime) {
      setError('Punch-in time is required');
      return;
    }

    // Convert times to UTC timestamps
    const newPunchIn = parseTimeForDate(session.date, punchInTime);
    const newPunchOut = punchOutTime
      ? parseTimeForDate(session.date, punchOutTime)
      : null;

    // Validate punch-out is after punch-in
    if (newPunchOut && !isEndAfterStart(newPunchIn, newPunchOut)) {
      setError('Punch-out time must be after punch-in time');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(session.id, newPunchIn, newPunchOut);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!session) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal">
        <div className="modal-header">
          <h3>Edit Session</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-date">
            <span>Date: {formatDateIST(session.date)}</span>
          </div>

          <div className="form-group">
            <label htmlFor="punch-in">Punch In Time</label>
            <input
              type="time"
              id="punch-in"
              value={punchInTime}
              onChange={(e) => setPunchInTime(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="punch-out">Punch Out Time</label>
            <input
              type="time"
              id="punch-out"
              value={punchOutTime}
              onChange={(e) => setPunchOutTime(e.target.value)}
              className="form-input"
              placeholder="Leave empty if still active"
            />
            <small className="form-hint">
              Leave empty to keep session active
            </small>
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

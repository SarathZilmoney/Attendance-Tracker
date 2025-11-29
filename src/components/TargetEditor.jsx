/**
 * Target editor component for setting custom monthly targets
 */

import { useState, useEffect } from 'react';

/**
 * TargetEditor component
 * @param {Object} props
 * @param {number} props.fixedTarget - Fixed target (read-only)
 * @param {number} props.customTarget - Current custom target
 * @param {Function} props.onUpdate - Handler for target update
 */
export function TargetEditor({ fixedTarget, customTarget, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(customTarget || fixedTarget);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(customTarget || fixedTarget);
  }, [customTarget, fixedTarget]);

  const handleSave = async () => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue <= 0) {
      alert('Please enter a valid positive number');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(numValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving target:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(customTarget || fixedTarget);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="target-editor">
      <div className="target-row">
        <span className="target-label">Fixed Target:</span>
        <span className="target-value">{fixedTarget} hours</span>
      </div>

      <div className="target-row">
        <span className="target-label">Custom Target:</span>
        {isEditing ? (
          <div className="target-edit-group">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="target-input"
              min="1"
              max="744"
              autoFocus
            />
            <span className="target-unit">hours</span>
            <button
              className="btn-sm btn-save"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? '...' : '✓'}
            </button>
            <button
              className="btn-sm btn-cancel"
              onClick={handleCancel}
              disabled={isSaving}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="target-display-group">
            <span className="target-value">
              {customTarget || fixedTarget} hours
            </span>
            <button
              className="btn-sm btn-edit"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

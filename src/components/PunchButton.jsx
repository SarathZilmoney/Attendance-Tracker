/**
 * Large punch in/out button component
 */

import { useState } from 'react';

/**
 * PunchButton component
 * @param {Object} props
 * @param {boolean} props.isPunchedIn - Current punch state
 * @param {Function} props.onPunchIn - Handler for punch in
 * @param {Function} props.onPunchOut - Handler for punch out
 * @param {boolean} props.disabled - Whether button is disabled
 */
export function PunchButton({ isPunchedIn, onPunchIn, onPunchOut, disabled }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      if (isPunchedIn) {
        await onPunchOut();
      } else {
        await onPunchIn();
      }
    } catch (error) {
      console.error('Punch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClass = `punch-button ${isPunchedIn ? 'punch-out' : 'punch-in'} ${
    isLoading ? 'loading' : ''
  }`;

  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-label={isPunchedIn ? 'Punch Out' : 'Punch In'}
    >
      <span className="punch-icon">{isPunchedIn ? '⏹' : '▶'}</span>
      <span className="punch-text">
        {isLoading
          ? 'Processing...'
          : isPunchedIn
          ? 'Punch Out'
          : 'Punch In'}
      </span>
    </button>
  );
}

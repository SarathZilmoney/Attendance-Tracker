/**
 * Live running timer component
 * Shows HH:MM:SS elapsed time since punch-in
 */

import { useState, useEffect } from 'react';
import { calculateElapsedSeconds, formatSecondsToHHMMSS } from '../utils/time';

/**
 * Timer component that displays elapsed time since punch-in
 * @param {Object} props
 * @param {string} props.punchInTime - UTC timestamp of punch-in
 * @param {boolean} props.isActive - Whether timer should be running
 */
export function Timer({ punchInTime, isActive }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isActive || !punchInTime) {
      setElapsed(0);
      return;
    }

    // Calculate initial elapsed time
    setElapsed(calculateElapsedSeconds(punchInTime));

    // Update every second
    const interval = setInterval(() => {
      setElapsed(calculateElapsedSeconds(punchInTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [punchInTime, isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="timer">
      <div className="timer-label">Working Time</div>
      <div className="timer-display">{formatSecondsToHHMMSS(elapsed)}</div>
    </div>
  );
}

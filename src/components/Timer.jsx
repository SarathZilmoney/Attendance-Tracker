/**
 * Live running timer component
 * Shows HH:MM:SS elapsed time since punch-in with progress ring
 */

import { useState, useEffect } from 'react';
import { calculateElapsedSeconds, formatSecondsToHHMMSS, formatDuration } from '../utils/time';

/**
 * Timer component that displays elapsed time since punch-in
 * @param {Object} props
 * @param {string} props.punchInTime - UTC timestamp of punch-in
 * @param {boolean} props.isActive - Whether timer should be running
 * @param {number} props.dailyTotal - Total minutes worked today
 * @param {number} props.targetHours - Daily target hours
 */
export function Timer({ punchInTime, isActive, dailyTotal = 0, targetHours = 8 }) {
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

  // Calculate progress for the ring
  const totalMinutesToday = dailyTotal + (isActive ? elapsed / 60 : 0);
  const targetMinutes = targetHours * 60;
  const progressPercent = Math.min((totalMinutesToday / targetMinutes) * 100, 100);
  const hoursWorked = totalMinutesToday / 60;

  // SVG circle calculations
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="timer-display-wrapper">
      <div className="timer-ring">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
          <circle
            className="timer-ring-bg"
            cx="36"
            cy="36"
            r={radius}
          />
          <circle
            className="timer-ring-progress"
            cx="36"
            cy="36"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            stroke="url(#timerGradient)"
          />
        </svg>
        <div className="timer-ring-text">{hoursWorked.toFixed(1)}h</div>
      </div>
      
      <div className="timer-info">
        <div className="timer-time">
          {isActive ? formatSecondsToHHMMSS(elapsed) : formatDuration(dailyTotal)}
          {isActive && (
            <span className="live-indicator">LIVE</span>
          )}
        </div>
        <div className="timer-target">of {targetHours}h daily target</div>
        <div className="timer-progress-bar">
          <div 
            className="timer-progress-fill" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

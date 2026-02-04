/**
 * Summary component showing stats in a modern grid layout
 */

import { formatDuration } from '../utils/time';

/**
 * Summary component
 * @param {Object} props
 * @param {number} props.dailyMinutes - Total minutes worked today
 * @param {number} props.monthlyMinutes - Total minutes worked this month
 * @param {number} props.fixedTarget - Fixed monthly target in hours
 * @param {number} props.customTarget - Custom monthly target in hours
 * @param {number} props.workingDays - Number of days worked this month
 * @param {number} props.avgHoursPerDay - Average hours per day
 */
export function Summary({
  dailyMinutes,
  monthlyMinutes,
  fixedTarget,
  customTarget,
  workingDays = 0,
  avgHoursPerDay = 0,
}) {
  const targetHours = customTarget || fixedTarget;
  const monthlyHours = monthlyMinutes / 60;
  const progressPercent = Math.min((monthlyHours / targetHours) * 100, 100);
  const hoursRemaining = targetHours - monthlyHours;
  const isAhead = hoursRemaining <= 0;

  return (
    <div className="stats-grid">
      {/* Today's Hours */}
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-icon orange">☀️</div>
        </div>
        <div className="stat-value">{formatDuration(dailyMinutes)}</div>
        <div className="stat-label">Today</div>
      </div>

      {/* Working Days */}
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-icon blue">📅</div>
        </div>
        <div className="stat-value">{workingDays}</div>
        <div className="stat-label">Days Worked</div>
      </div>

      {/* Monthly Hours */}
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-icon purple">📊</div>
          <span className={`stat-badge ${isAhead ? 'positive' : 'negative'}`}>
            {isAhead ? '+' : ''}{(-hoursRemaining).toFixed(1)}h
          </span>
        </div>
        <div className="stat-value">{monthlyHours.toFixed(1)}h</div>
        <div className="stat-label">This Month</div>
        <div className="stat-progress">
          <div className="stat-progress-bar">
            <div 
              className="stat-progress-fill purple" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Average Hours */}
      <div className="stat-card">
        <div className="stat-header">
          <div className="stat-icon cyan">⚡</div>
          <span className={`stat-badge ${avgHoursPerDay >= 8 ? 'positive' : 'neutral'}`}>
            {avgHoursPerDay >= 8 ? '✓' : `${(8 - avgHoursPerDay).toFixed(1)}h short`}
          </span>
        </div>
        <div className="stat-value">{avgHoursPerDay.toFixed(1)}h</div>
        <div className="stat-label">Avg/Day</div>
      </div>

      {/* Target Progress - Full Width */}
      <div className="stat-card full-width">
        <div className="stat-header">
          <div className="stat-icon green">🎯</div>
          <span className="stat-badge neutral">{targetHours}h target</span>
        </div>
        <div className="stat-value">{progressPercent.toFixed(1)}%</div>
        <div className="stat-label">Monthly Progress</div>
        <div className="stat-progress">
          <div className="stat-progress-bar">
            <div 
              className="stat-progress-fill green" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

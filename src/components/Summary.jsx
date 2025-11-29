/**
 * Summary component showing daily/monthly totals and progress
 */

import { formatDuration } from '../utils/time';

/**
 * Summary component
 * @param {Object} props
 * @param {number} props.dailyMinutes - Total minutes worked today
 * @param {number} props.monthlyMinutes - Total minutes worked this month
 * @param {number} props.fixedTarget - Fixed monthly target in hours
 * @param {number} props.customTarget - Custom monthly target in hours
 */
export function Summary({
  dailyMinutes,
  monthlyMinutes,
  fixedTarget,
  customTarget,
}) {
  const monthlyHours = monthlyMinutes / 60;
  const fixedProgress = Math.min((monthlyHours / fixedTarget) * 100, 100);
  const customProgress = customTarget
    ? Math.min((monthlyHours / customTarget) * 100, 100)
    : 0;

  return (
    <div className="summary">
      <div className="summary-card daily">
        <div className="summary-label">Today</div>
        <div className="summary-value">{formatDuration(dailyMinutes)}</div>
      </div>

      <div className="summary-card monthly">
        <div className="summary-label">This Month</div>
        <div className="summary-value">{formatDuration(monthlyMinutes)}</div>

        <div className="progress-section">
          <div className="progress-row">
            <span className="progress-label">Fixed ({fixedTarget}h)</span>
            <span className="progress-percent">
              {fixedProgress.toFixed(1)}%
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill fixed"
              style={{ width: `${fixedProgress}%` }}
            ></div>
          </div>
        </div>

        {customTarget && customTarget !== fixedTarget && (
          <div className="progress-section">
            <div className="progress-row">
              <span className="progress-label">Custom ({customTarget}h)</span>
              <span className="progress-percent">
                {customProgress.toFixed(1)}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill custom"
                style={{ width: `${customProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

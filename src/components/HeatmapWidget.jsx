/**
 * Activity Heatmap Widget Component
 */

/**
 * HeatmapWidget component
 * @param {Object} props
 * @param {Array} props.data - Heatmap data array
 * @param {string} props.avgStartTime - Average start time
 * @param {string} props.avgEndTime - Average end time
 * @param {string} props.bestDay - Best working day
 */
export function HeatmapWidget({ data = [], avgStartTime, avgEndTime, bestDay }) {
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Group data by weeks
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="heatmap-widget">
      <div className="heatmap-header">
        <span>📊</span>
        <span className="heatmap-title">Activity (Last 4 Weeks)</span>
      </div>

      {/* Day labels */}
      <div className="heatmap-grid">
        {dayLabels.map((day, i) => (
          <div key={`label-${i}`} className="heatmap-day-label">{day}</div>
        ))}
        
        {/* Heatmap cells */}
        {data.map((cell, i) => (
          <div 
            key={i}
            className={`heatmap-cell level-${cell.level}`}
            title={`${cell.date}: ${Math.round(cell.minutes / 60)}h`}
          />
        ))}
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-legend-cell" style={{ background: 'var(--color-surface-elevated)' }} />
        <div className="heatmap-legend-cell level-1" style={{ background: 'rgba(16, 185, 129, 0.2)' }} />
        <div className="heatmap-legend-cell level-2" style={{ background: 'rgba(16, 185, 129, 0.4)' }} />
        <div className="heatmap-legend-cell level-3" style={{ background: 'rgba(16, 185, 129, 0.6)' }} />
        <div className="heatmap-legend-cell level-4" style={{ background: 'rgba(16, 185, 129, 0.8)' }} />
        <span>More</span>
      </div>

      {/* Stats */}
      {(avgStartTime || bestDay) && (
        <div style={{ 
          marginTop: 'var(--spacing-md)', 
          paddingTop: 'var(--spacing-md)', 
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: 'var(--spacing-lg)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)'
        }}>
          {avgStartTime && (
            <div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Avg Start</div>
              <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{avgStartTime}</div>
            </div>
          )}
          {avgEndTime && (
            <div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Avg End</div>
              <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{avgEndTime}</div>
            </div>
          )}
          {bestDay && (
            <div>
              <div style={{ color: 'var(--color-text-secondary)' }}>Best Day</div>
              <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>{bestDay}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

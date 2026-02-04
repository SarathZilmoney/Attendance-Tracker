/**
 * Smart Insights Widget Component
 */

/**
 * InsightsWidget component
 * @param {Object} props
 * @param {Array} props.insights - Array of insight objects
 */
export function InsightsWidget({ insights = [] }) {
  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="insights-widget">
      <div className="insights-header">
        <span className="insights-icon">🧠</span>
        <span className="insights-title">Smart Insights</span>
      </div>
      
      {insights.slice(0, 4).map((insight, index) => (
        <div key={index} className={`insight-item ${insight.type}`}>
          <span>{insight.icon}</span>
          <span>{insight.text}</span>
        </div>
      ))}
    </div>
  );
}

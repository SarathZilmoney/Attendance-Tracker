/**
 * Gamification Widget Component
 * Shows streaks, badges, and weekly score
 */

/**
 * GamificationWidget component
 * @param {Object} props
 * @param {number} props.streak - Current streak count
 * @param {number} props.weeklyScore - Weekly score (0-100)
 * @param {Array} props.badges - Array of badge objects
 */
export function GamificationWidget({ streak = 0, weeklyScore = 0, badges = [] }) {
  const earnedBadges = badges.filter(b => b.earned);
  const inProgressBadges = badges.filter(b => !b.earned);

  return (
    <div className="gamification-widget">
      <div className="gamification-header">
        <div className="gamification-title">
          <span>🎮</span>
          <span>Achievements</span>
        </div>
        <div className="weekly-score">
          <span>Score:</span>
          <span>{weeklyScore}/100</span>
        </div>
      </div>

      {/* Streak Section */}
      <div className="streak-section">
        <div className="streak-icon">🔥</div>
        <div className="streak-info">
          <div className="streak-count">{streak} Days</div>
          <div className="streak-label">Current Streak</div>
        </div>
      </div>

      {/* Badges */}
      <div className="badges-section">
        {earnedBadges.map(badge => (
          <div 
            key={badge.id} 
            className={`badge earned ${badge.gold ? 'gold' : ''}`}
            title={`${badge.name} - Earned!`}
          >
            <span className="badge-icon">{badge.icon}</span>
            <span>{badge.name}</span>
          </div>
        ))}
        {inProgressBadges.slice(0, 2).map(badge => (
          <div 
            key={badge.id} 
            className="badge"
            title={`${badge.name} - ${badge.progress}/${badge.target}`}
          >
            <span className="badge-icon" style={{ opacity: 0.5 }}>{badge.icon}</span>
            <span>{badge.progress}/{badge.target}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

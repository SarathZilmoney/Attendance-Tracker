/**
 * Main App Component
 * Attendance Tracker with Punch In/Out functionality
 */

import { useState } from 'react';
import { useUserId } from './hooks/useUserId';
import { useSessions } from './hooks/useSessions';
import { useTargets } from './hooks/useTargets';
import { useAnalytics } from './hooks/useAnalytics';
import { getCurrentMonthYear, formatMonthYear, formatTimeIST, formatDuration } from './utils/time';

import { Timer } from './components/Timer';
import { PunchButton } from './components/PunchButton';
import { Summary } from './components/Summary';
import { TargetEditor } from './components/TargetEditor';
import { MonthSelector } from './components/MonthSelector';
import { SessionList } from './components/SessionList';
import { EditSessionModal } from './components/EditSessionModal';
import { ExportButton } from './components/ExportButton';
import { InsightsWidget } from './components/InsightsWidget';
import { GamificationWidget } from './components/GamificationWidget';
import { HeatmapWidget } from './components/HeatmapWidget';

import './App.css';

function App() {
  // User ID (UUID-based invisible login)
  const userId = useUserId();

  // Selected month for viewing
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());

  // Session management
  const {
    sessions,
    todaySessions,
    activeSession,
    loading: sessionsLoading,
    error: sessionsError,
    dailyTotal,
    monthlyTotal,
    punchIn,
    punchOut,
    updateSession,
    deleteSession,
  } = useSessions(userId, selectedMonth);

  // Target management
  const {
    fixedTarget,
    customTarget,
    loading: targetsLoading,
    updateCustomTarget,
  } = useTargets(userId, selectedMonth);

  // Analytics & Gamification
  const targetHours = customTarget || fixedTarget;
  const {
    insights,
    badges,
    streak,
    weeklyScore,
    heatmapData,
    avgStartTime,
    avgEndTime,
    bestDay,
  } = useAnalytics(sessions, sessions, targetHours);

  // Edit modal state
  const [editingSession, setEditingSession] = useState(null);

  // Loading state
  if (!userId) {
    return (
      <div className="app loading-screen">
        <div className="loading-spinner large"></div>
        <p>Initializing...</p>
      </div>
    );
  }

  const isPunchedIn = !!activeSession;
  const monthlyHours = monthlyTotal / 60;

  // Calculate working days and average
  const workingDays = new Set(sessions.map(s => s.date)).size;
  const avgHoursPerDay = workingDays > 0 ? monthlyHours / workingDays : 0;

  // Calculate today's break time (gaps between sessions)
  const todayBreakMinutes = (() => {
    if (!todaySessions || todaySessions.length < 2) return 0;
    
    // Sort sessions by punch_in time
    const sorted = [...todaySessions]
      .filter(s => s.punch_out) // Only completed sessions
      .sort((a, b) => a.punch_in.localeCompare(b.punch_in));
    
    let breakTime = 0;
    for (let i = 1; i < sorted.length; i++) {
      const prevEnd = new Date(sorted[i - 1].punch_out);
      const currStart = new Date(sorted[i].punch_in);
      const gap = (currStart - prevEnd) / (1000 * 60); // minutes
      if (gap > 0) {
        breakTime += gap;
      }
    }
    return Math.round(breakTime);
  })();

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>Attendance Tracker</h1>
        <div className="header-status">
          {isPunchedIn ? (
            <span className="status-badge active">
              Working since {formatTimeIST(activeSession.punch_in, 'HH:mm')}
            </span>
          ) : (
            <span className="status-badge">Not clocked in</span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Error Display */}
        {sessionsError && (
          <div className="error-banner">
            <span>⚠️ {sessionsError}</span>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* Attendance Widget */}
        <div className="attendance-widget">
          <div className="widget-header">
            <div className="widget-title-group">
              <div className="widget-icon">⏱️</div>
              <div>
                <div className="widget-title">Attendance</div>
                <div className="widget-subtitle">{isPunchedIn ? 'Working' : 'Offline'}</div>
              </div>
            </div>
            <span className={`widget-badge ${isPunchedIn ? 'present' : 'absent'}`}>
              {isPunchedIn ? 'Present' : 'Away'}
            </span>
          </div>

          <Timer 
            punchInTime={activeSession?.punch_in} 
            isActive={isPunchedIn}
            dailyTotal={dailyTotal}
            targetHours={8}
          />

          {/* Today's Sessions */}
          {todaySessions && todaySessions.length > 0 && (
            <div className="sessions-today">
              <div className="sessions-today-header">
                <div className="sessions-today-title">Sessions Today</div>
                {todayBreakMinutes > 0 && (
                  <div className="break-time-badge">
                    ☕ {formatDuration(todayBreakMinutes)} break
                  </div>
                )}
              </div>
              {todaySessions.slice(0, 4).map((session) => (
                <div 
                  key={session.id} 
                  className={`session-item ${session.id === activeSession?.id ? 'active' : ''}`}
                >
                  <div className="session-item-time">
                    <span>⏰</span>
                    {formatTimeIST(session.punch_in, 'HH:mm')} 
                    {session.punch_out ? ` → ${formatTimeIST(session.punch_out, 'HH:mm')}` : ' → ongoing'}
                  </div>
                  <div className="session-item-duration">
                    {session.punch_out ? formatDuration(session.duration_minutes) : 'Active'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Punch Button */}
        <section className="punch-section">
          <PunchButton
            isPunchedIn={isPunchedIn}
            onPunchIn={punchIn}
            onPunchOut={punchOut}
            disabled={sessionsLoading}
          />
        </section>

        {/* Smart Insights */}
        <InsightsWidget insights={insights} />

        {/* Gamification */}
        <GamificationWidget 
          streak={streak} 
          weeklyScore={weeklyScore} 
          badges={badges} 
        />

        {/* Activity Heatmap */}
        <HeatmapWidget 
          data={heatmapData}
          avgStartTime={avgStartTime}
          avgEndTime={avgEndTime}
          bestDay={bestDay}
        />

        {/* Stats Grid */}
        <Summary
          dailyMinutes={dailyTotal}
          monthlyMinutes={monthlyTotal}
          fixedTarget={fixedTarget}
          customTarget={customTarget}
          workingDays={workingDays}
          avgHoursPerDay={avgHoursPerDay}
        />

        {/* Month Selection & Targets */}
        <section className="controls-section">
          <MonthSelector
            selectedMonth={selectedMonth}
            onChange={setSelectedMonth}
          />
          <TargetEditor
            fixedTarget={fixedTarget}
            customTarget={customTarget}
            onUpdate={updateCustomTarget}
          />
          <ExportButton sessions={sessions} monthYear={selectedMonth} />
        </section>

        {/* Sessions List */}
        <section className="sessions-section">
          <h2 className="section-title">
            Sessions - {formatMonthYear(selectedMonth)}
          </h2>
          <SessionList
            sessions={sessions}
            activeSession={activeSession}
            onEdit={setEditingSession}
            onDelete={deleteSession}
            loading={sessionsLoading}
          />
        </section>
      </main>

      {/* Edit Modal */}
      {editingSession && (
        <EditSessionModal
          session={editingSession}
          onSave={updateSession}
          onClose={() => setEditingSession(null)}
        />
      )}

      {/* Footer */}
      <footer className="app-footer">
        <small>🔒 Data stored securely • ID: {userId.substring(0, 8)}...</small>
      </footer>
    </div>
  );
}

export default App;

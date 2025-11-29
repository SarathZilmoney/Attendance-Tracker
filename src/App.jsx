/**
 * Main App Component
 * Attendance Tracker with Punch In/Out functionality
 */

import { useState } from 'react';
import { useUserId } from './hooks/useUserId';
import { useSessions } from './hooks/useSessions';
import { useTargets } from './hooks/useTargets';
import { getCurrentMonthYear, formatMonthYear, formatTimeIST } from './utils/time';

import { Timer } from './components/Timer';
import { PunchButton } from './components/PunchButton';
import { Summary } from './components/Summary';
import { TargetEditor } from './components/TargetEditor';
import { MonthSelector } from './components/MonthSelector';
import { SessionList } from './components/SessionList';
import { EditSessionModal } from './components/EditSessionModal';
import { ExportButton } from './components/ExportButton';

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

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>Attendance Tracker</h1>
        <div className="header-status">
          {isPunchedIn && (
            <span className="status-badge active">
              Punched In at {formatTimeIST(activeSession.punch_in, 'HH:mm')}
            </span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        {/* Error Display */}
        {sessionsError && (
          <div className="error-banner">
            <span>Error: {sessionsError}</span>
            <button onClick={() => window.location.reload()}>Reload</button>
          </div>
        )}

        {/* Timer Section */}
        <section className="timer-section">
          <Timer punchInTime={activeSession?.punch_in} isActive={isPunchedIn} />
        </section>

        {/* Punch Button */}
        <section className="punch-section">
          <PunchButton
            isPunchedIn={isPunchedIn}
            onPunchIn={punchIn}
            onPunchOut={punchOut}
            disabled={sessionsLoading}
          />
        </section>

        {/* Summary Section */}
        <section className="summary-section">
          <Summary
            dailyMinutes={dailyTotal}
            monthlyMinutes={monthlyTotal}
            fixedTarget={fixedTarget}
            customTarget={customTarget}
          />
        </section>

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
        <small>Data stored securely • ID: {userId.substring(0, 8)}...</small>
      </footer>
    </div>
  );
}

export default App;

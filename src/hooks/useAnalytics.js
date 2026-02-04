/**
 * Hook for analytics, insights, and gamification
 */

import { useMemo } from 'react';
import { formatTimeIST, getTodayDateIST } from '../utils/time';

/**
 * Calculate analytics and insights from sessions
 * @param {Array} sessions - Array of session objects
 * @param {Array} allSessions - All sessions for broader analysis
 * @param {number} targetHours - Monthly target hours
 * @returns {Object} Analytics data
 */
export function useAnalytics(sessions, allSessions = [], targetHours = 200) {
  return useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        insights: [],
        badges: [],
        streak: 0,
        weeklyScore: 0,
        heatmapData: [],
        avgStartTime: null,
        avgEndTime: null,
        bestDay: null,
        worstDay: null,
        productiveHours: [],
        weekComparison: 0,
      };
    }

    const today = getTodayDateIST();
    const insights = [];
    const badges = [];

    // Group sessions by date
    const sessionsByDate = {};
    sessions.forEach(s => {
      if (!sessionsByDate[s.date]) {
        sessionsByDate[s.date] = [];
      }
      sessionsByDate[s.date].push(s);
    });

    // Calculate daily totals
    const dailyTotals = {};
    Object.entries(sessionsByDate).forEach(([date, daySessions]) => {
      dailyTotals[date] = daySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    });

    // Calculate average start and end times
    const startTimes = [];
    const endTimes = [];
    sessions.forEach(s => {
      if (s.punch_in) {
        const time = new Date(s.punch_in);
        startTimes.push(time.getHours() * 60 + time.getMinutes());
      }
      if (s.punch_out) {
        const time = new Date(s.punch_out);
        endTimes.push(time.getHours() * 60 + time.getMinutes());
      }
    });

    const avgStartMinutes = startTimes.length > 0 
      ? Math.round(startTimes.reduce((a, b) => a + b, 0) / startTimes.length)
      : null;
    const avgEndMinutes = endTimes.length > 0
      ? Math.round(endTimes.reduce((a, b) => a + b, 0) / endTimes.length)
      : null;

    const avgStartTime = avgStartMinutes !== null
      ? `${Math.floor(avgStartMinutes / 60).toString().padStart(2, '0')}:${(avgStartMinutes % 60).toString().padStart(2, '0')}`
      : null;
    const avgEndTime = avgEndMinutes !== null
      ? `${Math.floor(avgEndMinutes / 60).toString().padStart(2, '0')}:${(avgEndMinutes % 60).toString().padStart(2, '0')}`
      : null;

    // Find best and worst days
    const dayOfWeekTotals = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    Object.entries(dailyTotals).forEach(([date, minutes]) => {
      const dayOfWeek = new Date(date).getDay();
      dayOfWeekTotals[dayOfWeek].push(minutes);
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestDay = null;
    let worstDay = null;
    let bestAvg = 0;
    let worstAvg = Infinity;

    Object.entries(dayOfWeekTotals).forEach(([day, totals]) => {
      if (totals.length > 0) {
        const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
        if (avg > bestAvg) {
          bestAvg = avg;
          bestDay = dayNames[parseInt(day)];
        }
        if (avg < worstAvg) {
          worstAvg = avg;
          worstDay = dayNames[parseInt(day)];
        }
      }
    });

    // Calculate streak (consecutive days with >= 6 hours)
    let streak = 0;
    const sortedDates = Object.keys(dailyTotals).sort().reverse();
    for (const date of sortedDates) {
      if (dailyTotals[date] >= 360) { // 6 hours
        streak++;
      } else {
        break;
      }
    }

    // Calculate productive hours (which hours have most work)
    const hourlyWork = Array(24).fill(0);
    sessions.forEach(s => {
      if (s.punch_in && s.punch_out) {
        const start = new Date(s.punch_in);
        const end = new Date(s.punch_out);
        for (let h = start.getHours(); h <= end.getHours() && h < 24; h++) {
          hourlyWork[h] += 1;
        }
      }
    });

    const maxHourlyWork = Math.max(...hourlyWork);
    const productiveHours = hourlyWork.map((count, hour) => ({
      hour,
      count,
      level: maxHourlyWork > 0 ? Math.ceil((count / maxHourlyWork) * 4) : 0,
    }));

    // Week comparison
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let thisWeekMinutes = 0;
    let lastWeekMinutes = 0;

    Object.entries(dailyTotals).forEach(([date, minutes]) => {
      const d = new Date(date);
      if (d >= thisWeekStart) {
        thisWeekMinutes += minutes;
      } else if (d >= lastWeekStart && d < thisWeekStart) {
        lastWeekMinutes += minutes;
      }
    });

    const weekComparison = lastWeekMinutes > 0
      ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
      : 0;

    // Generate insights
    // Late arrival detection (after 10 AM)
    const lateArrivals = sessions.filter(s => {
      if (!s.punch_in) return false;
      const hour = new Date(s.punch_in).getHours();
      return hour >= 10;
    }).length;

    if (lateArrivals > 3) {
      insights.push({
        type: 'warning',
        icon: '⏰',
        text: `Late arrivals detected: ${lateArrivals} times this month`,
      });
    }

    // Early logout detection (before 5 PM with < 8 hours)
    const earlyLogouts = Object.entries(dailyTotals).filter(([date, minutes]) => {
      return minutes < 480 && minutes > 0; // Less than 8 hours
    }).length;

    if (earlyLogouts > 3) {
      insights.push({
        type: 'warning',
        icon: '🚪',
        text: `Early logouts: ${earlyLogouts} days with < 8 hours`,
      });
    }

    // Week comparison insight
    if (weekComparison !== 0) {
      insights.push({
        type: weekComparison > 0 ? 'success' : 'info',
        icon: weekComparison > 0 ? '📈' : '📉',
        text: `You worked ${Math.abs(weekComparison)}% ${weekComparison > 0 ? 'more' : 'less'} than last week`,
      });
    }

    // Consistency insight
    const workingDays = Object.keys(dailyTotals).length;
    if (workingDays >= 5) {
      const avgDaily = Object.values(dailyTotals).reduce((a, b) => a + b, 0) / workingDays;
      if (avgDaily >= 480) {
        insights.push({
          type: 'success',
          icon: '✨',
          text: `Great consistency! Averaging ${(avgDaily / 60).toFixed(1)}h per day`,
        });
      }
    }

    // Streak insight
    if (streak >= 3) {
      insights.push({
        type: 'success',
        icon: '🔥',
        text: `${streak} day streak! Keep it going!`,
      });
    }

    // Generate badges
    // Early Bird - Started before 9 AM at least 5 times
    const earlyStarts = sessions.filter(s => {
      if (!s.punch_in) return false;
      const hour = new Date(s.punch_in).getHours();
      return hour < 9;
    }).length;
    badges.push({
      id: 'early-bird',
      name: 'Early Bird',
      icon: '🌅',
      earned: earlyStarts >= 5,
      progress: Math.min(earlyStarts, 5),
      target: 5,
    });

    // Consistency King - 10+ days with 8+ hours
    const consistentDays = Object.values(dailyTotals).filter(m => m >= 480).length;
    badges.push({
      id: 'consistency',
      name: 'Consistency King',
      icon: '👑',
      earned: consistentDays >= 10,
      gold: consistentDays >= 10,
      progress: Math.min(consistentDays, 10),
      target: 10,
    });

    // Overtime Warrior - 3+ days with 10+ hours
    const overtimeDays = Object.values(dailyTotals).filter(m => m >= 600).length;
    badges.push({
      id: 'overtime',
      name: 'Overtime Warrior',
      icon: '⚔️',
      earned: overtimeDays >= 3,
      progress: Math.min(overtimeDays, 3),
      target: 3,
    });

    // Streak Master - 7+ day streak
    badges.push({
      id: 'streak',
      name: 'Streak Master',
      icon: '🔥',
      earned: streak >= 7,
      gold: streak >= 7,
      progress: Math.min(streak, 7),
      target: 7,
    });

    // Calculate weekly score (0-100)
    const totalMinutesThisMonth = Object.values(dailyTotals).reduce((a, b) => a + b, 0);
    const targetMinutes = targetHours * 60;
    const progressScore = Math.min((totalMinutesThisMonth / targetMinutes) * 50, 50);
    const consistencyScore = Math.min((consistentDays / 15) * 30, 30);
    const streakScore = Math.min((streak / 7) * 20, 20);
    const weeklyScore = Math.round(progressScore + consistencyScore + streakScore);

    // Generate heatmap data (last 4 weeks)
    const heatmapData = [];
    for (let i = 27; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const minutes = dailyTotals[dateStr] || 0;
      let level = 0;
      if (minutes > 0) level = 1;
      if (minutes >= 240) level = 2;
      if (minutes >= 480) level = 3;
      if (minutes >= 600) level = 4;
      heatmapData.push({
        date: dateStr,
        minutes,
        level,
        dayOfWeek: date.getDay(),
      });
    }

    return {
      insights,
      badges,
      streak,
      weeklyScore,
      heatmapData,
      avgStartTime,
      avgEndTime,
      bestDay,
      worstDay,
      productiveHours,
      weekComparison,
    };
  }, [sessions, allSessions, targetHours]);
}

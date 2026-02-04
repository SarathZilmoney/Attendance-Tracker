/**
 * Excel Export Utility
 * Generates XLSX files for attendance data export
 */

import * as XLSX from 'xlsx';
import { formatTimeIST, formatDateIST, formatDuration, formatMonthYear } from './time';

/**
 * Groups sessions by date and returns structured data
 * @param {Array} sessions - Array of session objects
 * @returns {Object} Object with dates as keys and array of sessions as values
 */
function groupSessionsByDate(sessions) {
  const grouped = {};
  
  sessions.forEach((session) => {
    const date = session.date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(session);
  });
  
  // Sort sessions within each day by punch_in time
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => a.punch_in.localeCompare(b.punch_in));
  });
  
  return grouped;
}

/**
 * Finds the maximum number of sessions in any single day
 * @param {Object} groupedSessions - Sessions grouped by date
 * @returns {number} Maximum session count
 */
function getMaxSessionsPerDay(groupedSessions) {
  return Math.max(...Object.values(groupedSessions).map(sessions => sessions.length), 1);
}

/**
 * Exports sessions for a given month to an Excel file
 * One row per day, with multiple sessions as columns
 * @param {Array} sessions - Array of session objects
 * @param {string} monthYear - Month in YYYY-MM format
 */
export function exportToExcel(sessions, monthYear) {
  if (!sessions || sessions.length === 0) {
    alert('No sessions to export for this month.');
    return;
  }

  // Group sessions by date
  const groupedSessions = groupSessionsByDate(sessions);
  const maxSessions = getMaxSessionsPerDay(groupedSessions);
  
  // Sort dates chronologically
  const sortedDates = Object.keys(groupedSessions).sort();
  
  // Build header row dynamically based on max sessions
  const headers = ['Date'];
  for (let i = 1; i <= maxSessions; i++) {
    headers.push(`Session ${i} In`);
    headers.push(`Session ${i} Out`);
    headers.push(`Session ${i} Duration`);
  }
  headers.push('Day Total');
  headers.push('Running Total');
  
  // Prepare data rows
  let runningTotalMinutes = 0;
  const data = sortedDates.map((date) => {
    const daySessions = groupedSessions[date];
    const row = {
      'Date': formatDateIST(date),
    };
    
    // Calculate day total
    let dayTotalMinutes = 0;
    
    // Add each session's data
    for (let i = 0; i < maxSessions; i++) {
      const sessionNum = i + 1;
      const session = daySessions[i];
      
      if (session) {
        row[`Session ${sessionNum} In`] = formatTimeIST(session.punch_in, 'HH:mm');
        row[`Session ${sessionNum} Out`] = session.punch_out 
          ? formatTimeIST(session.punch_out, 'HH:mm') 
          : 'Active';
        row[`Session ${sessionNum} Duration`] = session.punch_out 
          ? formatDuration(session.duration_minutes)
          : 'In Progress';
        dayTotalMinutes += session.duration_minutes || 0;
      } else {
        // Empty cells for days with fewer sessions
        row[`Session ${sessionNum} In`] = '';
        row[`Session ${sessionNum} Out`] = '';
        row[`Session ${sessionNum} Duration`] = '';
      }
    }
    
    runningTotalMinutes += dayTotalMinutes;
    row['Day Total'] = formatDuration(dayTotalMinutes);
    row['Running Total'] = formatDuration(runningTotalMinutes);
    
    return row;
  });

  // Add empty row and summary
  const emptyRow = {};
  headers.forEach(h => emptyRow[h] = '');
  data.push(emptyRow);
  
  const summaryRow = { 'Date': 'TOTAL' };
  headers.slice(1, -1).forEach(h => summaryRow[h] = '');
  summaryRow['Running Total'] = formatDuration(runningTotalMinutes);
  data.push(summaryRow);

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });

  // Set column widths dynamically
  const colWidths = [{ wch: 14 }]; // Date column
  for (let i = 0; i < maxSessions; i++) {
    colWidths.push({ wch: 10 }); // Session In
    colWidths.push({ wch: 10 }); // Session Out
    colWidths.push({ wch: 12 }); // Session Duration
  }
  colWidths.push({ wch: 12 }); // Day Total
  colWidths.push({ wch: 14 }); // Running Total
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  // Generate filename
  const filename = `Attendance_${formatMonthYear(monthYear).replace(' ', '_')}.xlsx`;

  // Trigger download
  XLSX.writeFile(workbook, filename);
}

/**
 * Exports all sessions data (for backup purposes)
 * @param {Array} sessions - Array of all session objects
 */
export function exportAllData(sessions) {
  if (!sessions || sessions.length === 0) {
    alert('No data to export.');
    return;
  }

  // Sort by date
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.punch_in.localeCompare(b.punch_in);
  });

  const data = sortedSessions.map((session) => ({
    'Date': formatDateIST(session.date),
    'Punch In': formatTimeIST(session.punch_in, 'HH:mm:ss'),
    'Punch Out': session.punch_out ? formatTimeIST(session.punch_out, 'HH:mm:ss') : 'Active',
    'Duration (minutes)': session.duration_minutes || 0,
    'Session ID': session.id,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 40 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'All Attendance');

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Attendance_Backup_${date}.xlsx`);
}

/**
 * Excel Export Utility
 * Generates XLSX files for attendance data export
 */

import * as XLSX from 'xlsx';
import { formatTimeIST, formatDateIST, formatDuration, formatMonthYear } from './time';

/**
 * Exports sessions for a given month to an Excel file
 * @param {Array} sessions - Array of session objects
 * @param {string} monthYear - Month in YYYY-MM format
 */
export function exportToExcel(sessions, monthYear) {
  if (!sessions || sessions.length === 0) {
    alert('No sessions to export for this month.');
    return;
  }

  // Sort sessions by date and punch_in time
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.punch_in.localeCompare(b.punch_in);
  });

  // Prepare data with running total
  let runningTotalMinutes = 0;
  const data = sortedSessions.map((session) => {
    runningTotalMinutes += session.duration_minutes || 0;

    return {
      'Date': formatDateIST(session.date),
      'Punch In': formatTimeIST(session.punch_in, 'HH:mm:ss'),
      'Punch Out': session.punch_out ? formatTimeIST(session.punch_out, 'HH:mm:ss') : 'Active',
      'Session Duration': formatDuration(session.duration_minutes),
      'Running Total Hours': formatDuration(runningTotalMinutes),
    };
  });

  // Add summary row
  data.push({});
  data.push({
    'Date': 'TOTAL',
    'Punch In': '',
    'Punch Out': '',
    'Session Duration': '',
    'Running Total Hours': formatDuration(runningTotalMinutes),
  });

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Date
    { wch: 12 }, // Punch In
    { wch: 12 }, // Punch Out
    { wch: 18 }, // Session Duration
    { wch: 20 }, // Running Total Hours
  ];

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

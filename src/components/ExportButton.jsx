/**
 * Excel export button component
 */

import { exportToExcel } from '../utils/excel';
import { formatMonthYear } from '../utils/time';

/**
 * ExportButton component
 * @param {Object} props
 * @param {Array} props.sessions - Sessions to export
 * @param {string} props.monthYear - Month in YYYY-MM format
 */
export function ExportButton({ sessions, monthYear }) {
  const handleExport = () => {
    exportToExcel(sessions, monthYear);
  };

  const hasData = sessions && sessions.length > 0;

  return (
    <button
      className="export-button"
      onClick={handleExport}
      disabled={!hasData}
      title={hasData ? `Export ${formatMonthYear(monthYear)}` : 'No data to export'}
    >
      <span className="export-icon">📊</span>
      <span className="export-text">Export to Excel</span>
    </button>
  );
}

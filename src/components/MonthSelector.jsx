/**
 * Month selector dropdown component
 */

import { getMonthOptions } from '../utils/time';

/**
 * MonthSelector component
 * @param {Object} props
 * @param {string} props.selectedMonth - Currently selected month (YYYY-MM)
 * @param {Function} props.onChange - Handler for month change
 */
export function MonthSelector({ selectedMonth, onChange }) {
  const monthOptions = getMonthOptions();

  return (
    <div className="month-selector">
      <label htmlFor="month-select" className="month-label">
        Select Month:
      </label>
      <select
        id="month-select"
        value={selectedMonth}
        onChange={(e) => onChange(e.target.value)}
        className="month-dropdown"
      >
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Format date string (YYYY-MM-DD) into Dutch format like "5 okt", "12 nov", etc.
 */
export function formatTrelloDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const dutchMonths = [
        'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
        'jul', 'aug', 'sep', 'okt', 'nov', 'dec'
      ];
      return `${day} ${dutchMonths[monthIndex] || ''}`;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

/**
 * Check if a date string is in the past (overdue)
 */
export function isDateOverdue(dateStr: string): boolean {
  try {
    const target = new Date(dateStr + 'T23:59:59');
    return target.getTime() < Date.now();
  } catch {
    return false;
  }
}

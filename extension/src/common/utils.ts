/**
 * Get today's date string in local timezone
 * @returns Date string in format "YYYY-MM-DD" (e.g., "2025-12-15")
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


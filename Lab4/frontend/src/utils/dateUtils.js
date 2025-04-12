/**
 * Utility functions for handling dates in the application
 */

/**
 * Format a date object or string to YYYY-MM-DD format for HTML date input
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatDateForInput:', date);
      return '';
    }
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Format a date for display to users (more human-readable)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string for display
 */
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date provided to formatDateForDisplay:', date);
      return '';
    }
    
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '';
  }
};

/**
 * Get a default deadline date (30 days from now)
 * @returns {string} Default deadline date in YYYY-MM-DD format
 */
export const getDefaultDeadline = () => {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return formatDateForInput(date);
};

/**
 * Debug function to log date transformations
 * @param {string} label - Label for the log
 * @param {any} dateValue - Date value to log
 */
export const debugDate = (label, dateValue) => {
  console.log(`[DATE DEBUG] ${label}:`, {
    originalValue: dateValue,
    type: typeof dateValue,
    asDate: dateValue ? new Date(dateValue) : null,
    formatted: dateValue ? formatDateForInput(dateValue) : null,
    display: dateValue ? formatDateForDisplay(dateValue) : null
  });
};

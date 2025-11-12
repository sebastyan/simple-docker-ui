/**
 * Truncate text to a maximum length and add ellipsis
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text with ellipsis if needed
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Check if text needs truncation
 * @param {string} text - The text to check
 * @param {number} maxLength - Maximum length before truncation
 * @returns {boolean} - True if text is longer than maxLength
 */
export const needsTruncation = (text, maxLength = 50) => {
  return text && text.length > maxLength;
};

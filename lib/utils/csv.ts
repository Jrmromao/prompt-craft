/**
 * Escapes a string for CSV format
 * @param str The string to escape
 * @returns The escaped string
 */
export function escapeCsvValue(str: string): string {
  if (str === null || str === undefined) return '';
  
  // Convert to string if not already
  const stringValue = String(str);
  
  // If the string contains commas, quotes, or newlines, wrap it in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    // Double up any quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts an array of values to a CSV row
 * @param values Array of values to convert
 * @returns CSV-formatted row
 */
export function toCsvRow(values: (string | number | null | undefined)[]): string {
  return values.map(value => escapeCsvValue(value?.toString() ?? '')).join(',');
} 
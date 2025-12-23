/**
 * Converts snake_case or technical column names to human-readable Title Case
 */
export function formatColumnName(name: string): string {
  if (!name) return '';
  
  return name
    // Handle snake_case
    .replace(/_/g, ' ')
    // Handle camelCase
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    // Handle abbreviations like 'ID', 'URL', etc.
    .replace(/\b(id|url|api|ui|ux)\b/gi, (match) => match.toUpperCase())
    // Capitalize first letter of each word
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

/**
 * Creates a human-readable chart title from axis names
 */
export function formatChartTitle(yAxis: string, xAxis: string, type?: string): string {
  const formattedY = formatColumnName(yAxis);
  const formattedX = formatColumnName(xAxis);
  
  if (type === 'scatter') {
    return `${formattedY} vs ${formattedX}`;
  }
  
  if (type === 'pie') {
    return `${formattedY} by ${formattedX}`;
  }
  
  return `${formattedY} by ${formattedX}`;
}

/**
 * Truncates text with ellipsis if it exceeds max length
 */
export function truncateText(text: string, maxLength: number = 40): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

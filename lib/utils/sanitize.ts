/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags and attributes
 */
export function sanitizeHtml(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  // Remove data: protocol (except for images)
  sanitized = sanitized.replace(/(<(?!img)[^>]+\s+(?:src|href)\s*=\s*["'])data:/gi, '$1');
  
  // Remove iframe, object, embed tags
  sanitized = sanitized.replace(/<(iframe|object|embed|applet|meta|link|base)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  
  // Remove style tags with expressions
  sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?expression\s*\([^)]*\)[\s\S]*?<\/style>/gi, '');
  
  return sanitized;
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

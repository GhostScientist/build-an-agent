/**
 * Generator utility functions
 */

/**
 * Sanitize a name for use in TypeScript class names and identifiers
 */
export function sanitizeClassName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '') // Remove spaces
    .replace(/^[0-9]/, '_$&'); // Prefix with underscore if starts with number
}

/**
 * Convert a project name to a valid package name
 */
export function toPackageName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Escape string for use in template literals
 */
export function escapeTemplateString(str: string): string {
  return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

/**
 * Indent multiline string
 */
export function indent(str: string, spaces: number = 2): string {
  const indentation = ' '.repeat(spaces);
  return str
    .split('\n')
    .map((line) => (line.trim() ? indentation + line : line))
    .join('\n');
}

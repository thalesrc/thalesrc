/**
 * Safely parse JSON string, returning undefined on failure.
 * @param value - JSON string to parse
 * @returns Parsed value or undefined if parsing fails
 */
export function jsonParse<T>(value: string): T {
  try {
    return JSON.parse(value);
  } catch {
    return undefined!;
  }
}

import type { JsonObject } from './types.js';

/**
 * Extracts a JSON object from model text output, tolerating markdown code
 * fences or stray prose around the object.
 */
export function parseJsonObject(text: string): JsonObject {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end < start) {
    throw new Error('Model response did not contain a JSON object');
  }
  return JSON.parse(text.slice(start, end + 1));
}

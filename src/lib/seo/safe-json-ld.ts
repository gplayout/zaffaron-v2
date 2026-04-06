/**
 * Safely serialize an object for injection into a <script type="application/ld+json"> tag.
 * Escapes characters that could break out of the script context (XSS prevention).
 */
export function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");
}

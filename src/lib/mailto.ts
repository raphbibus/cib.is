/**
 * Obfuscated contact address (R8 / AC6, A10).
 *
 * The plaintext address must never appear in the rendered HTML — not as a
 * `mailto:` link, not as raw text. We XOR each byte with a fixed key and
 * base64 the result, so the emitted token contains neither `@`, `mailto:`,
 * the local-part nor the domain. `MailtoLink.astro` ships a tiny inline
 * script that calls `decode()` on first interaction to assemble the href.
 *
 * This resists *trivial* scraping (regexes for `mailto:` / `@`); it is not
 * cryptography.
 */
export const CONTACT_EMAIL = 'website@cib.is';

/** Single-byte XOR key. Kept in sync with the inline decoder in MailtoLink. */
export const MAILTO_KEY = 0x2a;

export function encode(addr: string): string {
  let out = '';
  for (let i = 0; i < addr.length; i++) {
    out += String.fromCharCode(addr.charCodeAt(i) ^ MAILTO_KEY);
  }
  // btoa is available in Node 18+ and all evergreen browsers.
  return btoa(out);
}

export function decode(token: string): string {
  const raw = atob(token);
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    out += String.fromCharCode(raw.charCodeAt(i) ^ MAILTO_KEY);
  }
  return out;
}

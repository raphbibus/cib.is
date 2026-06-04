/**
 * Homegrown, first-party captcha (R6 / AC5, TD2).
 *
 * The site has no server, so the math question can only be *verified* in the
 * browser — it is friction for JS-running bots, not a hard gate (the honeypot
 * + Netlify's spam filter are the real no-JS defence; see spec §7). A small
 * addition question is generated at build time; its answer is XOR+base64
 * encoded (same obfuscation style as `mailto.ts`) into a `data-*` attribute so
 * the plaintext answer never appears verbatim in the served HTML. The bundled
 * form script reads it back with `decodeAnswer()` and gates the AJAX submit.
 *
 * This resists *trivial* scraping; it is not cryptography.
 */
export interface Challenge {
  /** German question text rendered into the captcha field label, e.g. "Wie viel ist 4 + 3?" */
  question: string;
  /** The integer the user must enter. */
  answer: number;
}

/** Single-byte XOR key for the answer token (mailto.ts uses its own key). */
export const CAPTCHA_KEY = 0x5b;

/** Build-time: a small addition the target audience answers without effort. */
export function makeChallenge(): Challenge {
  const a = 2 + Math.floor(Math.random() * 8); // 2..9
  const b = 1 + Math.floor(Math.random() * 8); // 1..8
  return { question: `Wie viel ist ${a} + ${b}?`, answer: a + b };
}

/** Client-side: compare the user's (string) input against the decoded answer. */
export function verify(input: string | number, answer: number): boolean {
  const n = typeof input === 'number' ? input : Number(String(input).trim());
  return Number.isInteger(n) && n === answer;
}

export function encodeAnswer(answer: number): string {
  const s = String(answer);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    out += String.fromCharCode(s.charCodeAt(i) ^ CAPTCHA_KEY);
  }
  return btoa(out);
}

export function decodeAnswer(token: string): number {
  const raw = atob(token);
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    out += String.fromCharCode(raw.charCodeAt(i) ^ CAPTCHA_KEY);
  }
  return Number(out);
}

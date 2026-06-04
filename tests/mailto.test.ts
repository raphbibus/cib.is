import { describe, it, expect } from 'vitest';
import { encode, decode, CONTACT_EMAIL } from '@/lib/mailto';

// T6 / AC6 — obfuscation must round-trip yet never leak the plaintext address.
describe('lib/mailto', () => {
  it('round-trips: decode(encode(addr)) === addr', () => {
    expect(decode(encode(CONTACT_EMAIL))).toBe(CONTACT_EMAIL);
    expect(decode(encode('foo.bar+x@example.org'))).toBe('foo.bar+x@example.org');
  });

  it('encoded token contains neither the literal "@" nor "mailto:" nor the plaintext address', () => {
    const token = encode(CONTACT_EMAIL);
    expect(token).not.toContain('@');
    expect(token.toLowerCase()).not.toContain('mailto:');
    expect(token).not.toContain(CONTACT_EMAIL);
  });

  it('encoded token does not contain the local-part or domain verbatim', () => {
    const token = encode(CONTACT_EMAIL);
    const [local, domain] = CONTACT_EMAIL.split('@');
    expect(token).not.toContain(local);
    expect(token).not.toContain(domain);
  });
});

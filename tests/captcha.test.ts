import { describe, it, expect } from 'vitest';
import { makeChallenge, verify, encodeAnswer, decodeAnswer } from '@/lib/captcha';

// T7 — homegrown first-party captcha (R6, AC5). A small math question generated
// at build time; the answer is lightly encoded (XOR+base64, mailto.ts style) in
// a data-* attribute and decoded client-side. No third party, no cookies.
describe('lib/captcha', () => {
  it('makeChallenge() returns a question string and an integer answer', () => {
    for (let i = 0; i < 50; i++) {
      const { question, answer } = makeChallenge();
      expect(typeof question).toBe('string');
      expect(question.length).toBeGreaterThan(0);
      expect(Number.isInteger(answer)).toBe(true);
    }
  });

  it('verify() accepts the correct answer and rejects wrong ones', () => {
    const { answer } = makeChallenge();
    expect(verify(answer, answer)).toBe(true);
    expect(verify(String(answer), answer)).toBe(true); // strings from the input field
    expect(verify(` ${answer} `, answer)).toBe(true); // tolerant of whitespace
    expect(verify(answer + 1, answer)).toBe(false);
    expect(verify('', answer)).toBe(false);
    expect(verify('abc', answer)).toBe(false);
  });

  it('encodeAnswer/decodeAnswer round-trip', () => {
    for (const n of [0, 7, 12, 18, 99]) {
      expect(decodeAnswer(encodeAnswer(n))).toBe(n);
    }
  });

  it('the encoded token never contains the plaintext answer verbatim (TD2)', () => {
    for (let i = 0; i < 50; i++) {
      const { answer } = makeChallenge();
      const token = encodeAnswer(answer);
      expect(token).not.toContain(String(answer));
    }
  });
});

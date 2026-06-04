import { describe, it, expect } from 'vitest';
import { validate, EMAIL_RE } from '@/lib/formValidate';

// T5 — pure client-side validation (R5, AC4). Required: name, email, message.
// Email must look like an address. Company/role are optional.
const MSG = {
  name: 'Name fehlt.',
  email: 'E-Mail fehlt.',
  emailFormat: 'E-Mail ungültig.',
  message: 'Nachricht fehlt.',
};

describe('lib/formValidate', () => {
  it('flags all three required fields when empty', () => {
    const res = validate({ name: '', email: '', message: '' }, MSG);
    expect(res.valid).toBe(false);
    expect(res.errors.name).toBe(MSG.name);
    expect(res.errors.email).toBe(MSG.email);
    expect(res.errors.message).toBe(MSG.message);
  });

  it('treats whitespace-only required fields as empty', () => {
    const res = validate({ name: '   ', email: '  ', message: '\t' }, MSG);
    expect(res.valid).toBe(false);
    expect(res.errors.name).toBe(MSG.name);
  });

  it('flags a malformed email with the format message', () => {
    const res = validate({ name: 'Ada', email: 'not-an-email', message: 'Hallo' }, MSG);
    expect(res.valid).toBe(false);
    expect(res.errors.email).toBe(MSG.emailFormat);
  });

  it('does not require company or role', () => {
    const res = validate(
      { name: 'Ada', email: 'ada@example.com', message: 'Hallo', company: '', role: '' },
      MSG,
    );
    expect(res.valid).toBe(true);
    expect(res.errors).toEqual({});
  });

  it('passes a fully valid submission', () => {
    const res = validate(
      { name: 'Ada Lovelace', email: 'ada@example.com', message: 'Wir kommen nicht ins Liefern.' },
      MSG,
    );
    expect(res.valid).toBe(true);
  });

  it('exposes an email regex that accepts normal and rejects broken addresses', () => {
    expect(EMAIL_RE.test('ada@example.com')).toBe(true);
    expect(EMAIL_RE.test('foo.bar+x@sub.example.org')).toBe(true);
    expect(EMAIL_RE.test('ada@')).toBe(false);
    expect(EMAIL_RE.test('@example.com')).toBe(false);
    expect(EMAIL_RE.test('ada example.com')).toBe(false);
    expect(EMAIL_RE.test('ada@example')).toBe(false);
  });
});

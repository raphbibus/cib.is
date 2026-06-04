/**
 * Pure client-side validation for the contact form (R5 / AC4).
 *
 * Required: name, email, message. Email must look like an address. Company and
 * role are optional. Messages are passed in from the typed content module so
 * all German copy stays in `src/content/offers.ts` (coding-guidelines.md).
 * The no-JS path relies on native HTML5 `required` + `type="email"`; this is
 * the JS upgrade that produces inline, screen-reader-accessible messages.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ContactValues {
  name?: string;
  email?: string;
  message?: string;
  company?: string;
  role?: string;
  [key: string]: string | undefined;
}

export interface ValidationMessages {
  name: string;
  email: string;
  emailFormat: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  /** field name → message; empty when valid. */
  errors: Record<string, string>;
}

export function validate(values: ContactValues, messages: ValidationMessages): ValidationResult {
  const errors: Record<string, string> = {};
  const name = (values.name ?? '').trim();
  const email = (values.email ?? '').trim();
  const message = (values.message ?? '').trim();

  if (!name) errors.name = messages.name;

  if (!email) errors.email = messages.email;
  else if (!EMAIL_RE.test(email)) errors.email = messages.emailFormat;

  if (!message) errors.message = messages.message;

  return { valid: Object.keys(errors).length === 0, errors };
}

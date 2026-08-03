const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_SHAPE_PATTERN = /^[+\d][\d\s().-]{6,}$/;
const MIN_PHONE_DIGITS = 7;

export function isValidEmailOrPhone(value) {
  const trimmed = value.trim();
  if (EMAIL_PATTERN.test(trimmed)) return true;
  if (!PHONE_SHAPE_PATTERN.test(trimmed)) return false;
  const digitCount = (trimmed.match(/\d/g) || []).length;
  return digitCount >= MIN_PHONE_DIGITS;
}

export function validateForm({ name, contact, message }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'required';
  if (!contact || !isValidEmailOrPhone(contact)) errors.contact = 'invalid';
  if (!message || !message.trim()) errors.message = 'required';
  return { valid: Object.keys(errors).length === 0, errors };
}

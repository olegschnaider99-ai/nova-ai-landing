const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s().-]{6,}$/;

export function isValidEmailOrPhone(value) {
  const trimmed = value.trim();
  return EMAIL_PATTERN.test(trimmed) || PHONE_PATTERN.test(trimmed);
}

export function validateForm({ name, contact, message }) {
  const errors = {};
  if (!name || !name.trim()) errors.name = 'required';
  if (!contact || !isValidEmailOrPhone(contact)) errors.contact = 'invalid';
  if (!message || !message.trim()) errors.message = 'required';
  return { valid: Object.keys(errors).length === 0, errors };
}

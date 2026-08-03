import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isValidEmailOrPhone, validateForm } from '../js/validation.js';

test('accepts a valid email', () => {
  assert.equal(isValidEmailOrPhone('someone@example.com'), true);
});

test('accepts a valid phone number', () => {
  assert.equal(isValidEmailOrPhone('+380 67 123 4567'), true);
});

test('rejects a string with neither an email nor a phone shape', () => {
  assert.equal(isValidEmailOrPhone('not-a-contact'), false);
});

test('rejects a phone-shaped string padded with separators instead of real digits', () => {
  assert.equal(isValidEmailOrPhone('1......'), false);
});

test('validateForm passes with all fields filled correctly', () => {
  const { valid, errors } = validateForm({ name: 'Олег', contact: 'test@test.com', message: 'Привіт' });
  assert.equal(valid, true);
  assert.deepEqual(errors, {});
});

test('validateForm flags a missing name as required', () => {
  const { valid, errors } = validateForm({ name: '', contact: 'test@test.com', message: 'Привіт' });
  assert.equal(valid, false);
  assert.equal(errors.name, 'required');
});

test('validateForm flags an invalid contact value', () => {
  const { valid, errors } = validateForm({ name: 'Олег', contact: 'xyz', message: 'Привіт' });
  assert.equal(valid, false);
  assert.equal(errors.contact, 'invalid');
});

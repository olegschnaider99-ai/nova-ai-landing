import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translate, dictionary } from '../js/i18n-data.js';

test('translate returns the Ukrainian string for a known key', () => {
  assert.equal(translate('hero.title', 'ua'), 'Твоя ідея заслуговує вибухового старту');
});

test('translate returns the English string for a known key', () => {
  assert.equal(translate('hero.title', 'en'), 'Your idea deserves an explosive start');
});

test('translate falls back to a visible marker for an unknown key', () => {
  assert.equal(translate('nonexistent.key', 'ua'), '[[nonexistent.key]]');
});

test('every dictionary entry has both ua and en strings', () => {
  const missing = Object.entries(dictionary).filter(
    ([, value]) => !value.ua || !value.en
  );
  assert.deepEqual(missing, []);
});

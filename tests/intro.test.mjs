import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldPlayIntro } from '../js/intro.js';

test('plays intro on a fresh session with no motion preference', () => {
  assert.equal(shouldPlayIntro({ prefersReducedMotion: false, alreadyPlayed: false }), true);
});

test('skips intro if already played this session', () => {
  assert.equal(shouldPlayIntro({ prefersReducedMotion: false, alreadyPlayed: true }), false);
});

test('skips intro if the user prefers reduced motion, even on a fresh session', () => {
  assert.equal(shouldPlayIntro({ prefersReducedMotion: true, alreadyPlayed: false }), false);
});

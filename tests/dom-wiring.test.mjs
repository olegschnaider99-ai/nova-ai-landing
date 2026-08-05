import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initStickyHeader, initNavToggle } from '../js/nav.js';
import { initContactForm } from '../js/form.js';
import { initServiceChips, applyInterestFromQueryParam } from '../js/services.js';

/**
 * These init functions are called unconditionally on every page from
 * js/main.js, but several of their target elements (#hero, #contact-form,
 * service chips) only exist on index.html, not on the 6 ai-*.html pages.
 * A missing-element assumption in any one of them throws and silently
 * aborts every init call queued after it — that's exactly what happened
 * with initStickyHeader before it got its `if (!hero) return;` guard.
 * This file is a regression test for that failure mode, not a full DOM
 * simulation — it stubs just enough of `document`/`window` to prove each
 * function tolerates the "page doesn't have this element" case.
 */
function withFakeDom(fn) {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  const originalIO = globalThis.IntersectionObserver;

  globalThis.document = {
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => []
  };
  globalThis.window = { location: { search: '' } };
  // Real browsers throw a TypeError if .observe() is called with anything
  // other than an Element — replicate that so a missing-guard regression
  // (e.g. `document.getElementById('hero')` returning null and getting
  // passed straight into .observe()) actually fails this test.
  globalThis.IntersectionObserver = class {
    observe(target) {
      if (target === null || typeof target !== 'object') {
        throw new TypeError(
          "Failed to execute 'observe' on 'IntersectionObserver': parameter 1 is not of type 'Element'."
        );
      }
    }
  };

  try {
    fn();
  } finally {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
    globalThis.IntersectionObserver = originalIO;
  }
}

test('initStickyHeader does not throw when #hero is absent (service-detail pages)', () => {
  assert.doesNotThrow(() => withFakeDom(() => initStickyHeader()));
});

test('initNavToggle does not throw when .nav-toggle/.main-nav are absent', () => {
  assert.doesNotThrow(() => withFakeDom(() => initNavToggle()));
});

test('initContactForm does not throw when #contact-form is absent (service-detail pages)', () => {
  assert.doesNotThrow(() => withFakeDom(() => initContactForm(() => 'ua')));
});

test('initServiceChips does not throw when no [data-service-chip] elements exist', () => {
  assert.doesNotThrow(() => withFakeDom(() => initServiceChips()));
});

test('applyInterestFromQueryParam does not throw with no query string and no contact form', () => {
  assert.doesNotThrow(() => withFakeDom(() => applyInterestFromQueryParam()));
});

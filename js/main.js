import { initI18n, getCurrentLang } from './i18n.js';
import { initIntro } from './intro.js';
import { initStickyHeader } from './nav.js';
import { initServiceChips, applyInterestFromQueryParam } from './services.js';
import { initContactForm } from './form.js';
import { initStarfield } from './starfield.js';

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initI18n();
  initIntro();
  initStickyHeader();
  initServiceChips();
  applyInterestFromQueryParam();
  initContactForm(getCurrentLang);
});

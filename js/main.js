import { initI18n, getCurrentLang } from './i18n.js';
import { initIntro } from './intro.js';
import { initStickyHeader } from './nav.js';
import { initServiceChips } from './services.js';
import { initContactForm } from './form.js';

document.addEventListener('DOMContentLoaded', () => {
  initI18n();
  initIntro();
  initStickyHeader();
  initServiceChips();
  initContactForm(getCurrentLang);
});

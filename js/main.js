import { initI18n, getCurrentLang } from './i18n.js';
import { initIntro } from './intro.js';
import { initStickyHeader, initNavToggle } from './nav.js';
import { initServiceChips, applyInterestFromQueryParam } from './services.js';
import { initContactForm } from './form.js';
import { initStarfield } from './starfield.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initMagneticButtons } from './magnetic.js';
import { initLightbox } from './lightbox.js';

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initI18n();
  initIntro();
  initStickyHeader();
  initNavToggle();
  initServiceChips();
  applyInterestFromQueryParam();
  initContactForm(getCurrentLang);
  initScrollReveal();
  initMagneticButtons();
  initLightbox();
});

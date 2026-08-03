import { translate } from './i18n-data.js';

const STORAGE_KEY = 'novaAiLang';
let currentLang = localStorage.getItem(STORAGE_KEY) || 'ua';

export function getCurrentLang() {
  return currentLang;
}

export function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem(STORAGE_KEY, lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = translate(el.dataset.i18n, lang);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', translate(el.dataset.i18nPlaceholder, lang));
  });
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.textContent = lang === 'ua' ? 'EN' : 'UA';
  });
}

export function initI18n() {
  applyLanguage(currentLang);
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLanguage(currentLang === 'ua' ? 'en' : 'ua');
    });
  });
}

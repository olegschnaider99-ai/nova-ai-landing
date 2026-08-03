import { translate } from './i18n-data.js';

const STORAGE_KEY = 'novaAiLang';
const HTML_LANG_TAG = { ua: 'uk', en: 'en' };

function readStoredLang() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage unavailable (e.g. blocked site data) — language still works for this page view */
  }
}

let currentLang = readStoredLang() || 'ua';

export function getCurrentLang() {
  return currentLang;
}

export function applyLanguage(lang) {
  currentLang = lang;
  writeStoredLang(lang);
  document.documentElement.lang = HTML_LANG_TAG[lang] ?? lang;
  document.title = translate('meta.title', lang);

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

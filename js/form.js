import { validateForm } from './validation.js';
import { translate } from './i18n-data.js';

export function initContactForm(getCurrentLang) {
  const form = document.getElementById('contact-form');
  const successEl = document.getElementById('contact-success');
  if (!form || !successEl) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = {
      name: form.elements.name.value,
      contact: form.elements.contact.value,
      message: form.elements.message.value
    };
    const { valid, errors } = validateForm(data);
    clearFieldErrors(form);

    if (!valid) {
      showFieldErrors(form, errors, getCurrentLang());
      return;
    }

    form.hidden = true;
    successEl.hidden = false;
    successEl.textContent = translate('contact.successMessage', getCurrentLang());
  });
}

function clearFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach((el) => {
    el.textContent = '';
  });
  ['name', 'contact', 'message'].forEach((field) => {
    const input = form.elements[field];
    if (input) {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  });
}

function showFieldErrors(form, errors, lang) {
  Object.entries(errors).forEach(([field, type]) => {
    const key = type === 'required' ? 'contact.errorRequired' : 'contact.errorEmail';
    const el = form.querySelector(`[data-error-for="${field}"]`);
    if (el) el.textContent = translate(key, lang);

    const input = form.elements[field];
    if (input && el) {
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', el.id);
    }
  });
}

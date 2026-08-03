export function initServiceChips() {
  document.querySelectorAll('[data-service-chip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const serviceId = btn.dataset.serviceChip;
      const checkbox = document.querySelector(
        `#contact-form input[name="interest"][value="${serviceId}"]`
      );
      if (checkbox) checkbox.checked = true;
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

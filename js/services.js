function checkInterest(serviceId) {
  const checkbox = document.querySelector(
    `#contact-form input[name="interest"][value="${serviceId}"]`
  );
  if (checkbox) checkbox.checked = true;
}

export function initServiceChips() {
  document.querySelectorAll('[data-service-chip]').forEach((btn) => {
    btn.addEventListener('click', () => {
      checkInterest(btn.dataset.serviceChip);
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/**
 * Service detail pages link back with ?interest=<id>#contact so the
 * matching checkbox is already ticked when the visitor lands on the form.
 */
export function applyInterestFromQueryParam() {
  const params = new URLSearchParams(window.location.search);
  const serviceId = params.get('interest');
  if (!serviceId) return;
  checkInterest(serviceId);
}

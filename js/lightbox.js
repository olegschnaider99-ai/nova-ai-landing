export function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastFocused = null;

  function open(src, alt, captionText, trigger) {
    lastFocused = trigger;
    img.src = src;
    img.alt = alt || '';
    caption.textContent = captionText || '';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';

    function activate() {
      lightbox.classList.add('is-open');
    }
    if (prefersReducedMotion) {
      activate();
    } else {
      requestAnimationFrame(activate);
    }
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';

    function finish() {
      lightbox.hidden = true;
    }
    if (prefersReducedMotion) {
      finish();
    } else {
      lightbox.addEventListener('transitionend', finish, { once: true });
    }
    if (lastFocused) lastFocused.focus();
  }

  // Portfolio grid: decorative img (alt=""), caption lives in the
  // sibling <figcaption> instead.
  document.querySelectorAll('.portfolio-card-trigger').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.portfolio-card');
      const image = btn.querySelector('img');
      const figcaption = card ? card.querySelector('figcaption') : null;
      if (!image) return;
      open(image.src, image.alt, figcaption ? figcaption.textContent : '', btn);
    });
  });

  // Service-detail gallery: previously just navigated to
  // index.html#portfolio instead of showing the photo. Keep the href
  // as a genuine no-JS fallback; intercept the click when JS is live.
  // These images already carry real alt text (data-i18n-alt), so it
  // doubles as the caption.
  document.querySelectorAll('.service-detail-gallery-item').forEach((link) => {
    link.addEventListener('click', (event) => {
      const image = link.querySelector('img');
      if (!image) return;
      event.preventDefault();
      open(image.src, image.alt, image.alt, link);
    });
  });

  closeBtn.addEventListener('click', close);

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) close();
  });
}

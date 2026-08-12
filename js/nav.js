export function initStickyHeader() {
  const header = document.querySelector('.site-header');
  const hero = document.getElementById('hero');
  if (!hero) return;

  const floatingCta = document.querySelector('.floating-cta');

  const observer = new IntersectionObserver(
    ([entry]) => {
      header.classList.toggle('is-sticky', !entry.isIntersecting);
      // The hero already carries a loud primary CTA in the first
      // viewport; showing the floating one at the same time was a
      // second identical ask before the first had a chance to work.
      // Reveal it only once the hero (and its own button) scroll
      // out of view. Pages with no #hero never reach this branch, so
      // service-detail pages keep the floating CTA visible from load.
      if (floatingCta) floatingCta.classList.toggle('is-visible', !entry.isIntersecting);
    },
    { threshold: 0 }
  );
  observer.observe(hero);
}

export function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
}

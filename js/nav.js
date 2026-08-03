export function initStickyHeader() {
  const header = document.querySelector('.site-header');
  const hero = document.getElementById('hero');

  const observer = new IntersectionObserver(
    ([entry]) => header.classList.toggle('is-sticky', !entry.isIntersecting),
    { threshold: 0 }
  );
  observer.observe(hero);
}

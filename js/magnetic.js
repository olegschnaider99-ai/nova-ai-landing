const STRENGTH = 0.35;
const EASE = 0.15;
const SNAP_THRESHOLD = 0.05;

export function initMagneticButtons() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (prefersReducedMotion || !hasFinePointer) return;

  const targets = document.querySelectorAll('.btn-primary, .floating-cta');

  targets.forEach((el) => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    // Raw 1:1 tracking amplified every bit of mouse-sensor noise straight
    // onto the button, reading as a twitch rather than a pull. Same
    // exponential-approach smoothing js/starfield.js already uses for
    // cursor parallax, applied here instead of a CSS transition (which
    // would restart -- and visibly stutter -- on every mousemove).
    function frame() {
      currentX += (targetX - currentX) * EASE;
      currentY += (targetY - currentY) * EASE;
      el.style.transform = `translate(${currentX}px, ${currentY}px)`;

      if (Math.abs(targetX - currentX) > SNAP_THRESHOLD || Math.abs(targetY - currentY) > SNAP_THRESHOLD) {
        rafId = requestAnimationFrame(frame);
      } else {
        rafId = null;
      }
    }

    function ensureLoop() {
      if (rafId === null) rafId = requestAnimationFrame(frame);
    }

    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      targetX = (event.clientX - (rect.left + rect.width / 2)) * STRENGTH;
      targetY = (event.clientY - (rect.top + rect.height / 2)) * STRENGTH;
      ensureLoop();
    });

    el.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      ensureLoop();
    });
  });
}

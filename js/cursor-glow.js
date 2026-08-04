export function initCursorGlow() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (prefersReducedMotion || !hasFinePointer) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-glow';
  document.body.appendChild(dot);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;

  window.addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    dot.classList.add('is-active');
  });

  window.addEventListener('mouseout', (event) => {
    if (!event.relatedTarget) dot.classList.remove('is-active');
  });

  function frame() {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    dot.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

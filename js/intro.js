const SESSION_KEY = 'novaAiIntroPlayed';

export function shouldPlayIntro({ prefersReducedMotion, alreadyPlayed }) {
  return !prefersReducedMotion && !alreadyPlayed;
}

export function initIntro() {
  const overlay = document.getElementById('intro-overlay');
  const canvas = document.getElementById('intro-canvas');
  const skipBtn = document.getElementById('intro-skip');

  const alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === '1';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  sessionStorage.setItem(SESSION_KEY, '1');

  if (!shouldPlayIntro({ prefersReducedMotion, alreadyPlayed })) {
    overlay.remove();
    return;
  }

  const stopAnimation = runParticleAnimation(canvas, overlay);
  skipBtn.addEventListener('click', () => {
    stopAnimation();
    finishIntro(overlay);
  });
}

function runParticleAnimation(canvas, overlay) {
  const ctx = canvas.getContext('2d');
  let width, height;
  let stopped = false;
  let rafId = null;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const PARTICLE_COLORS = ['155, 95, 224', '95, 196, 255', '224, 95, 176'];

  // A dim, static backdrop starfield so the scene reads as "space" from
  // frame one, not just a handful of moving dots on a flat fill.
  const backdropStarCount = window.innerWidth < 768 ? 120 : 260;
  const backdropStars = Array.from({ length: backdropStarCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.1 + 0.3,
    opacity: 0.2 + Math.random() * 0.4
  }));

  const particleCount = window.innerWidth < 768 ? 90 : 200;
  const particles = Array.from({ length: particleCount }, () => {
    const side = Math.random() < 0.5 ? -1 : 1;
    const isGlow = Math.random() < 0.08;
    // Triangular distribution biases particles toward vertical center,
    // reading as a galactic plane rather than a uniform random scatter.
    const y = ((Math.random() + Math.random()) / 2) * height;
    return {
      side,
      startX: width / 2 + side * (10 + Math.random() * 20),
      y,
      radius: isGlow ? 2.4 + Math.random() * 1.8 : Math.random() * 1.6 + 0.4,
      speed: 0.5 + Math.random() * 0.5,
      opacity: isGlow ? 0.7 + Math.random() * 0.3 : 0.4 + Math.random() * 0.6,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      isGlow
    };
  });

  const duration = 2500;
  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function cleanup() {
    stopped = true;
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
  }

  function frame(now) {
    if (stopped) return;

    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(t);

    ctx.clearRect(0, 0, width, height);
    const bg = ctx.createRadialGradient(
      width / 2, height * 0.35, 0,
      width / 2, height * 0.35, Math.max(width, height) * 0.75
    );
    bg.addColorStop(0, '#170a2e');
    bg.addColorStop(0.55, '#0a0414');
    bg.addColorStop(1, '#030106');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    backdropStars.forEach((s) => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
      ctx.fill();
    });

    particles.forEach((p) => {
      const travel = eased * (width / 2) * p.speed;
      const x = p.startX + p.side * travel;
      const alpha = p.opacity * (1 - eased * 0.3);

      if (p.isGlow) {
        const glow = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.radius * 6);
        glow.addColorStop(0, `rgba(${p.color}, ${alpha * 0.4})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, p.y, p.radius * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
      ctx.fill();
    });

    if (t < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      cleanup();
      revealLogo(overlay);
    }
  }
  rafId = requestAnimationFrame(frame);

  return cleanup;
}

function revealLogo(overlay) {
  const logo = overlay.querySelector('.intro-logo');
  logo.classList.add('is-visible');
  setTimeout(() => finishIntro(overlay), 900);
}

function finishIntro(overlay) {
  overlay.classList.add('is-hidden');
  setTimeout(() => overlay.remove(), 500);
}

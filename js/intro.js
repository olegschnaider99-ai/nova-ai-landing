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

  const PARTICLE_COLORS = ['255, 255, 255', '255, 255, 255', '255, 255, 255', '155, 95, 224', '95, 196, 255', '224, 95, 176'];

  // A dense, uniformly-distributed starfield covering the whole screen
  // from frame one — this is the actual "sky", not a handful of dots.
  const isMobile = window.innerWidth < 768;
  const starCount = isMobile ? 260 : 520;
  const sigma = width * (isMobile ? 0.16 : 0.13);

  const stars = Array.from({ length: starCount }, () => {
    const originX = Math.random() * width;
    // Triangular distribution biases particles toward vertical center,
    // reading as a galactic plane rather than a uniform random scatter.
    const y = ((Math.random() + Math.random()) / 2) * height;
    const dx = originX - width / 2;
    const direction = dx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dx);
    // Gaussian falloff: stars near the center line get pushed hard open,
    // stars already far from center barely move — a seam splitting the
    // sky apart, not two clumps sliding away from a narrow starting band.
    const falloff = Math.exp(-((dx * dx) / (2 * sigma * sigma)));
    const isGlow = Math.random() < 0.05;
    return {
      originX,
      y,
      direction,
      falloff,
      radius: isGlow ? 1.8 + Math.random() * 1.4 : Math.random() * 1.3 + 0.3,
      opacity: isGlow ? 0.75 + Math.random() * 0.25 : 0.35 + Math.random() * 0.5,
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

    const maxPush = width * 0.55;

    stars.forEach((s) => {
      const push = eased * maxPush * s.falloff;
      const x = s.originX + s.direction * push;
      // Stars swept through the opening seam fade slightly as they go,
      // rather than the whole field dimming uniformly.
      const alpha = s.opacity * (1 - s.falloff * eased * 0.35);

      if (s.isGlow) {
        const glow = ctx.createRadialGradient(x, s.y, 0, x, s.y, s.radius * 4.5);
        glow.addColorStop(0, `rgba(${s.color}, ${alpha * 0.35})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color}, ${alpha})`;
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

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

  runParticleAnimation(canvas, overlay);
  skipBtn.addEventListener('click', () => finishIntro(overlay));
}

function runParticleAnimation(canvas, overlay) {
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particleCount = window.innerWidth < 768 ? 60 : 140;
  const particles = Array.from({ length: particleCount }, () => {
    const side = Math.random() < 0.5 ? -1 : 1;
    return {
      side,
      startX: width / 2 + side * (10 + Math.random() * 20),
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.4,
      speed: 0.5 + Math.random() * 0.5,
      opacity: 0.4 + Math.random() * 0.6
    };
  });

  const duration = 2500;
  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function frame(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(t);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#020409';
    ctx.fillRect(0, 0, width, height);

    particles.forEach((p) => {
      const travel = eased * (width / 2) * p.speed;
      const x = p.startX + p.side * travel;
      ctx.beginPath();
      ctx.arc(x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(191, 232, 255, ${p.opacity * (1 - eased * 0.3)})`;
      ctx.fill();
    });

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      revealLogo(overlay);
    }
  }
  requestAnimationFrame(frame);
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

const STAR_COLORS = ['255,255,255', '214,225,255', '255,244,224'];

function generateStars(width, height) {
  const density = width < 768 ? 0.00022 : 0.00032;
  const count = Math.min(Math.round(width * height * density), 900);

  return Array.from({ length: count }, () => {
    const isBright = Math.random() < 0.06;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: isBright ? 1.4 + Math.random() * 1.4 : 0.4 + Math.random() * 0.9,
      opacity: isBright ? 0.75 + Math.random() * 0.25 : 0.25 + Math.random() * 0.5,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      glow: isBright
    };
  });
}

function drawStars(ctx, stars, width, height) {
  ctx.clearRect(0, 0, width, height);
  stars.forEach((star) => {
    if (star.glow) {
      const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 5);
      gradient.addColorStop(0, `rgba(${star.color}, ${star.opacity * 0.35})`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${star.color}, ${star.opacity})`;
    ctx.fill();
  });
}

export function initStarfield() {
  const canvas = document.getElementById('cosmic-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let stars = [];

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = generateStars(width, height);
    drawStars(ctx, stars, width, height);
  }

  resize();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const brightStars = () => stars.filter((s) => s.glow);
  let lastTwinkle = 0;

  function twinkleFrame(timestamp) {
    if (timestamp - lastTwinkle > 900) {
      lastTwinkle = timestamp;
      brightStars().forEach((s) => {
        s.opacity = 0.6 + Math.random() * 0.4;
      });
      drawStars(ctx, stars, window.innerWidth, window.innerHeight);
    }
    requestAnimationFrame(twinkleFrame);
  }
  requestAnimationFrame(twinkleFrame);
}

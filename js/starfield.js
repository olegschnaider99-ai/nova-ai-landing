const STAR_COLORS = ['255,255,255', '255,238,224', '255,209,181'];

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
  let lastWidth = window.innerWidth;

  function fitCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function regenerate() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    stars = generateStars(width, height);
    drawStars(ctx, stars, width, height);
  }

  fitCanvas();
  regenerate();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Mobile browsers fire `resize` when the address bar collapses or
      // expands on scroll — that only changes innerHeight, never
      // innerWidth. Only a real width change (rotation, real resize)
      // warrants a fresh star field; anything else just needs the canvas
      // re-fitted and the existing stars redrawn so they don't visibly
      // reshuffle every time the visitor scrolls.
      fitCanvas();
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        regenerate();
      } else {
        drawStars(ctx, stars, window.innerWidth, window.innerHeight);
      }
    }, 200);
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

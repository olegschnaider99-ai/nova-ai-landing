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

function drawStars(ctx, stars, width, height, offsetX = 0, offsetY = 0) {
  ctx.clearRect(0, 0, width, height);
  stars.forEach((star) => {
    // Bright (foreground) stars drift slightly more than dim (background)
    // ones under cursor parallax — reads as depth, not just a flat shift.
    const depth = star.glow ? 1.4 : 1;
    const x = star.x + offsetX * depth;
    const y = star.y + offsetY * depth;
    if (star.glow) {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.radius * 5);
      gradient.addColorStop(0, `rgba(${star.color}, ${star.opacity * 0.35})`);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, star.radius * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, star.radius, 0, Math.PI * 2);
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

  // Cursor parallax — the starfield drifts a few pixels against the
  // pointer, desktop only. Small enough to feel like depth, not a gimmick.
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let targetOffsetX = 0;
  let targetOffsetY = 0;
  let offsetX = 0;
  let offsetY = 0;

  if (hasFinePointer) {
    window.addEventListener('mousemove', (event) => {
      targetOffsetX = -((event.clientX / window.innerWidth) - 0.5) * 24;
      targetOffsetY = -((event.clientY / window.innerHeight) - 0.5) * 24;
    });
  }

  const brightStars = () => stars.filter((s) => s.glow);
  let lastTwinkle = 0;

  function frame(timestamp) {
    if (hasFinePointer) {
      offsetX += (targetOffsetX - offsetX) * 0.04;
      offsetY += (targetOffsetY - offsetY) * 0.04;
    }
    if (timestamp - lastTwinkle > 900) {
      lastTwinkle = timestamp;
      brightStars().forEach((s) => {
        s.opacity = 0.6 + Math.random() * 0.4;
      });
    }
    drawStars(ctx, stars, window.innerWidth, window.innerHeight, offsetX, offsetY);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

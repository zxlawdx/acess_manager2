(function subtleMatrixBackground(){
  'use strict';

  const host =
    document.querySelector('#login-page') ||
    document.querySelector('.app-wrapper') ||
    document.body;

  if (!host) return;
  if (document.querySelector('#matrix-bg')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-bg';
  canvas.setAttribute('aria-hidden', 'true');
  host.prepend(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let fontSize = 14;
  let columns = 0;
  let drops = [];
  let frame = 0;
  const chars = '01<>/\\[]{}+-=*#$%&ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

  function resize() {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = width;
    canvas.height = height;

    fontSize = width < 700 ? 12 : 14;
    columns = Math.max(1, Math.floor(width / fontSize));
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -40));
  }

  function draw() {
    if (reducedMotion?.matches) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    /* Cap near 30 fps: enough motion for the terminal effect without making
       the WebView burn cycles behind operational data. */
    frame = requestAnimationFrame(draw);
    const now = performance.now();
    if (draw.last && now - draw.last < 32) return;
    draw.last = now;

    ctx.fillStyle = 'rgba(5, 8, 5, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = 'rgba(51,255,0,0.55)';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(text, x, y);

      if (y > height && Math.random() > 0.975) {
        drops[i] = Math.floor(Math.random() * -20);
      }

      drops[i]++;
    }
  }

  function motionChanged() {
    cancelAnimationFrame(frame);
    if (reducedMotion?.matches) {
      ctx.clearRect(0, 0, width, height);
    } else {
      requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  reducedMotion?.addEventListener?.('change', motionChanged);
  requestAnimationFrame(draw);
})();

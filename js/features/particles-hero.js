function initHeroParticles() {
  const canvas = document.querySelector("[data-hero-particles]");
  if (!canvas) return;

  const hero = canvas.closest(".hero");
  if (!hero) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const state = {
    w: 0,
    h: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    balloons: [],
    mouse: { x: 0, y: 0, active: false, lastMove: 0 },
    raf: 0,
    inView: true,
  };

  const palette = [
    [255, 215, 0], // yellow
    [255, 120, 120], // coral
    [140, 220, 255], // sky
    [170, 140, 255], // violet
    [130, 255, 190], // mint
  ];

  const calcCount = (w, h) => {
    const area = Math.max(1, w * h);
    const density = 0.000055;
    return clamp(Math.round(area * density), 10, 34);
  };

  const makeBalloon = () => {
    const base = pick(palette);
    const scale = rand(0.75, 1.25);
    const r = rand(10, 22) * scale;
    const speed = rand(0.22, 0.55) * (22 / r);
    const sway = rand(0.4, 1.0) * (r / 18);
    const drift = rand(-0.2, 0.2);
    const hueLift = rand(0.92, 1.08);

    return {
      x: rand(0, state.w),
      y: state.h + rand(20, state.h * 0.35),
      vx: drift,
      vy: -speed,
      r,
      a: rand(0.28, 0.62),
      sway,
      swaySpeed: rand(0.0009, 0.0016),
      phase: rand(0, Math.PI * 2),
      color: [base[0] * hueLift, base[1] * hueLift, base[2] * hueLift].map((v) => Math.round(clamp(v, 0, 255))),
      wobble: rand(0.0012, 0.0024),
      string: rand(16, 34) * scale,
    };
  };

  const setCount = (target) => {
    const next = [];
    const keep = Math.min(state.balloons.length, target);
    for (let i = 0; i < keep; i++) next.push(state.balloons[i]);
    for (let i = keep; i < target; i++) next.push(makeBalloon());
    state.balloons = next;
  };

  const resize = () => {
    const rect = hero.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));

    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.w = w;
    state.h = h;

    canvas.width = Math.floor(w * state.dpr);
    canvas.height = Math.floor(h * state.dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    setCount(calcCount(w, h));
  };

  const pointerMove = (e) => {
    const rect = hero.getBoundingClientRect();
    state.mouse.x = clamp(e.clientX - rect.left, 0, rect.width);
    state.mouse.y = clamp(e.clientY - rect.top, 0, rect.height);
    state.mouse.active = true;
    state.mouse.lastMove = performance.now();
  };

  const pointerLeave = () => {
    state.mouse.active = false;
  };

  const drawBalloon = (b, t) => {
    // soft glow
    const g = ctx.createRadialGradient(b.x, b.y, b.r * 0.2, b.x, b.y, b.r * 2.8);
    const glowA = b.a * 0.35;
    g.addColorStop(0, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, ${glowA})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // balloon body
    const body = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.45, b.r * 0.4, b.x, b.y, b.r * 1.6);
    body.addColorStop(0, `rgba(255,255,255, ${b.a * 0.35})`);
    body.addColorStop(0.35, `rgba(${b.color[0]}, ${b.color[1]}, ${b.color[2]}, ${b.a})`);
    body.addColorStop(1, `rgba(${Math.round(b.color[0] * 0.78)}, ${Math.round(b.color[1] * 0.78)}, ${Math.round(
      b.color[2] * 0.78
    )}, ${b.a})`);

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, b.r * 0.9, b.r * 1.12, Math.sin(t * b.wobble + b.phase) * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // tiny knot
    ctx.globalAlpha = b.a * 0.75;
    ctx.fillStyle = `rgba(${Math.round(b.color[0] * 0.65)}, ${Math.round(b.color[1] * 0.65)}, ${Math.round(
      b.color[2] * 0.65
    )}, 1)`;
    ctx.beginPath();
    ctx.moveTo(b.x - b.r * 0.18, b.y + b.r * 1.05);
    ctx.lineTo(b.x + b.r * 0.18, b.y + b.r * 1.05);
    ctx.lineTo(b.x, b.y + b.r * 1.24);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // string (subtle)
    ctx.strokeStyle = `rgba(255,255,255, ${b.a * 0.22})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const sx = b.x;
    const sy = b.y + b.r * 1.22;
    ctx.moveTo(sx, sy);
    const wob = Math.sin(t * b.swaySpeed + b.phase) * b.sway * 10;
    ctx.bezierCurveTo(sx + wob * 0.25, sy + b.string * 0.35, sx - wob * 0.55, sy + b.string * 0.7, sx + wob, sy + b.string);
    ctx.stroke();
  };

  const step = (t) => {
    const now = t;
    if (state.mouse.active && now - state.mouse.lastMove > 900) state.mouse.active = false;

    const friction = 0.985;
    const speedLimit = 0.9;
    const repelR = Math.min(220, Math.max(140, state.w * 0.22));
    const repelR2 = repelR * repelR;

    for (const b of state.balloons) {
      // gentle chaotic horizontal movement + upward travel
      const sway = Math.sin(now * b.swaySpeed + b.phase) * b.sway;
      b.vx += (sway - b.vx) * 0.012;
      b.vx += rand(-0.008, 0.008);

      if (state.mouse.active) {
        const dx = b.x - state.mouse.x;
        const dy = b.y - state.mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.001 && d2 < repelR2) {
          const d = Math.sqrt(d2);
          const k = 1 - d / repelR;
          const f = 0.55 * k * k;
          b.vx += (dx / d) * f;
          // slight lift when cursor is near
          b.vy -= (0.06 + 0.12 * k) * k;
        }
      }

      b.vx = clamp(b.vx, -speedLimit, speedLimit);
      b.vy = clamp(b.vy, -1.25, -0.08);

      b.x += b.vx;
      b.y += b.vy;
      b.vx *= friction;
      b.vy = lerp(b.vy, b.vy, 1);

      // wrap / respawn
      if (b.y < -b.r * 3.2) {
        const nb = makeBalloon();
        b.x = nb.x;
        b.y = nb.y;
        b.vx = nb.vx;
        b.vy = nb.vy;
        b.r = nb.r;
        b.a = nb.a;
        b.sway = nb.sway;
        b.swaySpeed = nb.swaySpeed;
        b.phase = nb.phase;
        b.color = nb.color;
        b.wobble = nb.wobble;
        b.string = nb.string;
      }

      if (b.x < -b.r * 3) b.x = state.w + b.r * 3;
      if (b.x > state.w + b.r * 3) b.x = -b.r * 3;
    }
  };

  const render = (t) => {
    ctx.clearRect(0, 0, state.w, state.h);
    ctx.globalCompositeOperation = "lighter";
    for (const b of state.balloons) drawBalloon(b, t);
    ctx.globalCompositeOperation = "source-over";
  };

  const loop = (t) => {
    if (!state.inView) return;
    step(t);
    render(t);
    state.raf = requestAnimationFrame(loop);
  };

  const start = () => {
    if (state.raf) return;
    state.raf = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (!state.raf) return;
    cancelAnimationFrame(state.raf);
    state.raf = 0;
  };

  const onVis = () => {
    if (document.visibilityState === "hidden") stop();
    else if (state.inView) start();
  };

  if (window.IntersectionObserver) {
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        state.inView = Boolean(entry && entry.isIntersecting);
        if (!state.inView) stop();
        else if (document.visibilityState !== "hidden") start();
      },
      { threshold: 0.05 }
    );
    io.observe(hero);
  }

  hero.addEventListener("pointermove", pointerMove, { passive: true });
  hero.addEventListener("pointerleave", pointerLeave, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", onVis);

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => resize());
    ro.observe(hero);
  }

  resize();
  start();
}


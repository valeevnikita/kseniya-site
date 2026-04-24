function initCtaParticles() {
  const canvas = document.querySelector("[data-cta-particles]");
  if (!canvas) return;

  const section = canvas.closest(".section--cta") || canvas.parentElement;
  if (!section) return;

  const btn = section.querySelector("[data-cta-button]");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const clampLocal = (v, min, max) => Math.max(min, Math.min(max, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  const state = {
    w: 0,
    h: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    dots: [],
    raf: 0,
    inView: true,
    attract: 0, // 0..1
    target: { x: 0, y: 0 },
  };

  const palette = [
    { rgb: [255, 255, 255], a: 0.45 },
    { rgb: [255, 255, 255], a: 0.28 },
    { rgb: [255, 215, 0], a: 0.22 },
    { rgb: [255, 226, 102], a: 0.18 },
  ];

  const makeDot = () => {
    const p = pick(palette);
    const r = rand(1.2, 2.8);
    return {
      x: rand(0, state.w),
      y: rand(0, state.h),
      vx: rand(-0.08, 0.08),
      vy: rand(-0.06, 0.06),
      r,
      tw: rand(0.002, 0.006),
      phase: rand(0, Math.PI * 2),
      rgb: p.rgb,
      a: p.a,
      glow: rand(8, 18),
      drift: rand(0.02, 0.07),
    };
  };

  const setCount = (n) => {
    const next = [];
    const keep = Math.min(state.dots.length, n);
    for (let i = 0; i < keep; i++) next.push(state.dots[i]);
    for (let i = keep; i < n; i++) next.push(makeDot());
    state.dots = next;
  };

  const resize = () => {
    const rect = section.getBoundingClientRect();
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

    const area = w * h;
    const density = 0.00006;
    setCount(clampLocal(Math.round(area * density), 40, 140));
  };

  const updateTarget = () => {
    const rect = section.getBoundingClientRect();
    if (!btn) {
      state.target.x = rect.width * 0.5;
      state.target.y = rect.height * 0.62;
      return;
    }

    const br = btn.getBoundingClientRect();
    state.target.x = clampLocal(br.left - rect.left + br.width * 0.5, 0, rect.width);
    state.target.y = clampLocal(br.top - rect.top + br.height * 0.5, 0, rect.height);
  };

  const step = (t) => {
    const wobble = t * 0.001;
    const attract = state.attract;
    const tx = state.target.x;
    const ty = state.target.y;

    const softPullR = Math.min(420, Math.max(240, state.w * 0.42));
    const softPullR2 = softPullR * softPullR;

    for (const d of state.dots) {
      // base drift (slow "floating lights")
      d.vx += Math.sin(wobble + d.phase) * d.drift * 0.02;
      d.vy += Math.cos(wobble * 0.9 + d.phase) * d.drift * 0.02;
      d.vx += rand(-0.01, 0.01);
      d.vy += rand(-0.01, 0.01);

      if (attract > 0.001) {
        const dx = tx - d.x;
        const dy = ty - d.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > 1 && dist2 < softPullR2) {
          const dist = Math.sqrt(dist2);
          const k = 1 - dist / softPullR;
          const force = (0.09 + 0.22 * k) * k * attract;
          d.vx += (dx / dist) * force;
          d.vy += (dy / dist) * force;
        }
      }

      // gentle damping + speed cap
      const cap = 0.55;
      d.vx = clampLocal(d.vx * 0.985, -cap, cap);
      d.vy = clampLocal(d.vy * 0.985, -cap, cap);

      d.x += d.vx;
      d.y += d.vy;

      // wrap around edges
      if (d.x < -40) d.x = state.w + 40;
      if (d.x > state.w + 40) d.x = -40;
      if (d.y < -40) d.y = state.h + 40;
      if (d.y > state.h + 40) d.y = -40;
    }
  };

  const render = (t) => {
    ctx.clearRect(0, 0, state.w, state.h);
    ctx.globalCompositeOperation = "lighter";

    for (const d of state.dots) {
      const tw = 0.55 + 0.45 * Math.sin(t * d.tw + d.phase);
      const a = d.a * tw;

      const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.glow);
      g.addColorStop(0, `rgba(${d.rgb[0]}, ${d.rgb[1]}, ${d.rgb[2]}, ${a})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.glow, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(${d.rgb[0]}, ${d.rgb[1]}, ${d.rgb[2]}, ${Math.min(1, a + 0.08)})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
  };

  const loop = (t) => {
    if (!state.inView) return;
    updateTarget();
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
    io.observe(section);
  }

  // Hover: "gather" particles towards the button
  if (btn) {
    const set = (on) => {
      state.attract = on ? 1 : 0;
      section.classList.toggle("is-gathering", on);
    };
    btn.addEventListener("mouseenter", () => set(true));
    btn.addEventListener("mouseleave", () => set(false));
    btn.addEventListener("focus", () => set(true));
    btn.addEventListener("blur", () => set(false));
  }

  window.addEventListener("resize", () => resize(), { passive: true });
  document.addEventListener("visibilitychange", onVis);

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => resize());
    ro.observe(section);
  }

  resize();
  start();
}


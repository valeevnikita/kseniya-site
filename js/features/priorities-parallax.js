function initPrioritiesParallax() {
  const section = document.querySelector(".section--priorities");
  if (!section) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  const isMobile = () => window.matchMedia("(max-width: 980px)").matches;
  const cards = [...section.querySelectorAll("[data-prio-card]")];
  if (!cards.length) return;

  const base = cards.map((el) => {
    const n = Number(el.getAttribute("data-prio-base-x"));
    return Number.isFinite(n) ? n : 0;
  });

  let raf = 0;

  const apply = () => {
    raf = 0;
    if (isMobile()) {
      cards.forEach((el) => {
        el.style.setProperty("--prio-x", "0px");
        el.style.setProperty("--prio-y", "0px");
        el.style.setProperty("--prio-r", "0deg");
      });
      return;
    }

    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || 0;
    const mid = vh * 0.58;
    const t = clamp((mid - rect.top) / Math.max(1, rect.height), 0, 1);
    const drift = (t - 0.5) * 2; // -1..1 through the section
    const amp = 34; // px (more noticeable)

    cards.forEach((el, i) => {
      const mul = i === 1 ? 1.25 : 0.9;
      const dir = i === 1 ? 1 : -1; // center card moves opposite a bit
      const x = base[i] + drift * amp * mul * dir;
      const y = drift * -10 * (i === 1 ? 0.7 : 1); // tiny float
      const r = drift * 1.4 * (i === 1 ? 1 : -1); // degrees

      el.style.setProperty("--prio-x", `${x.toFixed(2)}px`);
      el.style.setProperty("--prio-y", `${y.toFixed(2)}px`);
      el.style.setProperty("--prio-r", `${r.toFixed(2)}deg`);
    });
  };

  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(apply);
  };

  apply();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
}

function initVideoCats() {
  const root = $("[data-video-cats]");
  if (!root) return;

  const buttons = $$("[data-video-cat]", root);
  const panels = $$("[data-video-panel]");
  if (!buttons.length || !panels.length) return;

  const setActive = (id) => {
    buttons.forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-video-cat") === id));
    panels.forEach((p) => {
      p.hidden = p.getAttribute("data-video-panel") !== id;
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-video-cat");
      if (!id) return;
      setActive(id);
    });
  });
}


function initVideoRails() {
  $$("[data-video-rail-wrap]").forEach((wrap) => {
    const rail = $("[data-video-rail]", wrap);
    const prev = $("[data-rail-prev]", wrap);
    const next = $("[data-rail-next]", wrap);
    if (!rail || !prev || !next) return;

    const getStep = () => {
      const items = [...rail.children].filter((el) => el instanceof HTMLElement);
      if (items.length >= 2) {
        const step = items[1].offsetLeft - items[0].offsetLeft;
        return step > 0 ? step : items[0].getBoundingClientRect().width + 18;
      }
      const first = items[0];
      return first ? first.getBoundingClientRect().width + 18 : 340;
    };

    const update = () => {
      const atStart = rail.scrollLeft <= 2;
      const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
      prev.disabled = atStart;
      next.disabled = atEnd;
    };

    const scrollByStep = (dir) => {
      rail.scrollBy({ left: dir * getStep(), behavior: "smooth" });
      setTimeout(update, 250);
    };

    prev.addEventListener("click", (e) => {
      e.preventDefault();
      scrollByStep(-1);
    });
    next.addEventListener("click", (e) => {
      e.preventDefault();
      scrollByStep(1);
    });

    rail.addEventListener("scroll", () => update(), { passive: true });
    window.addEventListener("resize", () => update());
    update();
  });
}


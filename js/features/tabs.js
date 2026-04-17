function initGalleryCats() {
  const root = $("[data-gallery-cats]");
  if (!root) return;

  const section = root.closest("section") || document;
  const buttons = $$("[data-gallery-cat]", root);
  const panels = $$("[data-gallery-panel]", section);
  if (!buttons.length || !panels.length) return;

  const setActive = (id) => {
    buttons.forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-gallery-cat") === id));
    panels.forEach((p) => {
      const active = p.getAttribute("data-gallery-panel") === id;
      p.hidden = !active;
      if (active) {
        // Reset "More photos" state on tab switch for predictable UX
        const gallery = $("[data-gallery]", p);
        const btn = $("[data-gallery-more]", p);
        if (gallery) gallery.classList.remove("is-open");
        if (btn) btn.textContent = "Больше фото";
      }
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-gallery-cat");
      if (!id) return;
      setActive(id);
    });
  });
}

function initReviewsCats() {
  const root = $("[data-reviews-cats]");
  if (!root) return;

  const section = root.closest("section") || document;
  const buttons = $$("[data-reviews-cat]", root);
  const panels = $$("[data-reviews-panel]", section);
  if (!buttons.length || !panels.length) return;

  const setActive = (id) => {
    buttons.forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-reviews-cat") === id));
    panels.forEach((p) => {
      p.hidden = p.getAttribute("data-reviews-panel") !== id;
    });
    // Let other logic (slider buttons) update for active panel
    root.dispatchEvent(new CustomEvent("tabs:changed", { detail: { id } }));
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-reviews-cat");
      if (!id) return;
      setActive(id);
    });
  });
}


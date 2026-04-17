function initReviewsSlider() {
  const section = $("#reviews") || document;
  const prev = $("[data-reviews-prev]", section);
  const next = $("[data-reviews-next]", section);
  if (!prev || !next) return;

  const getActiveTrack = () => $("[data-reviews-panel]:not([hidden]) [data-reviews-track]", section) || $("[data-reviews-track]", section);

  const getStep = (track) => {
    const card = $(".review-card", track);
    const cardWidth = card ? card.getBoundingClientRect().width : 520;
    const gap = 18;
    return cardWidth + gap;
  };

  const update = () => {
    const track = getActiveTrack();
    if (!track) return;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  };

  const scroll = (dir) => {
    const track = getActiveTrack();
    if (!track) return;
    track.scrollBy({ left: dir * getStep(track), behavior: "smooth" });
    setTimeout(update, 220);
  };

  prev.addEventListener("click", (e) => {
    e.preventDefault();
    scroll(-1);
  });
  next.addEventListener("click", (e) => {
    e.preventDefault();
    scroll(1);
  });

  // Update disabled states while user scrolls by touch/trackpad
  document.addEventListener(
    "scroll",
    () => {
      const track = getActiveTrack();
      if (!track) return;
      update();
    },
    { passive: true, capture: true }
  );

  const tabsRoot = $("[data-reviews-cats]", section);
  if (tabsRoot) tabsRoot.addEventListener("tabs:changed", () => setTimeout(update, 0));

  window.addEventListener("resize", () => update());
  update();
}

function initReviewModal() {
  const modal = $("[data-review-modal]");
  const closers = $$("[data-review-close]");
  const avatar = $("[data-review-modal-avatar]");
  const name = $("[data-review-modal-name]");
  const text = $("[data-review-modal-text]");
  if (!modal || !avatar || !name || !text) return;

  const cards = $$(".review-card");
  if (!cards.length) return;

  const setOpen = (open) => {
    modal.setAttribute("aria-hidden", open ? "false" : "true");
    document.documentElement.style.overflow = open ? "hidden" : "";
  };

  const getInitials = (fullName) =>
    String(fullName || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase();

  const computeExpandable = () => {
    cards.forEach((card) => {
      const p = $("p", card);
      if (!p) return;
      const expandable = p.scrollHeight - p.clientHeight > 6;
      card.classList.toggle("is-expandable", expandable);

      // Fill initials automatically when no avatar image (or when image fails to load)
      const title = $(".review-card__name", card)?.textContent?.trim() || "";
      const initialsEl = $(".review-card__initials", card);
      if (initialsEl && !String(initialsEl.textContent || "").trim()) {
        initialsEl.textContent = getInitials(title);
      }
    });
  };

  const openFrom = (card) => {
    const title = $(".review-card__name", card)?.textContent?.trim() || "Отзыв";
    const p = $("p", card);
    const fullText = p ? p.innerText.trim() : "";

    name.textContent = title;
    text.textContent = fullText;

    const img = $("img", $(".review-card__avatar", card));
    if (img && img.getAttribute("src") && img.style.display !== "none") {
      avatar.innerHTML = `<img src="${img.getAttribute("src")}" alt="" />`;
    } else {
      avatar.textContent = getInitials(title);
    }

    setOpen(true);
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (!card.classList.contains("is-expandable")) return;
      openFrom(card);
    });
  });

  closers.forEach((c) =>
    c.addEventListener("click", (e) => {
      e.preventDefault();
      setOpen(false);
    })
  );

  document.addEventListener("keydown", (e) => {
    if (modal.getAttribute("aria-hidden") !== "false") return;
    if (e.key === "Escape") setOpen(false);
  });

  const schedule = () => requestAnimationFrame(() => computeExpandable());
  window.addEventListener("resize", schedule);
  window.addEventListener("load", schedule);
  schedule();
}


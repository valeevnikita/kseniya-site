function initGalleryRails() {
  $$("[data-gallery-rail-wrap]").forEach((wrap) => {
    const rail = $("[data-gallery-rail]", wrap);
    const prev = $("[data-gallery-prev]", wrap);
    const next = $("[data-gallery-next]", wrap);
    if (!rail || !prev || !next) return;

    const getStep = () => {
      const items = [...rail.children].filter((el) => el instanceof HTMLElement);
      if (items.length >= 2) {
        const step = items[1].offsetLeft - items[0].offsetLeft;
        return step > 0 ? step : items[0].getBoundingClientRect().width + 18;
      }
      const first = items[0];
      return first ? first.getBoundingClientRect().width + 18 : 320;
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

function initGallery() {
  $$("[data-gallery]").forEach((root) => {
    const btn = $("[data-gallery-more]", root);
    if (!btn) return;
    btn.addEventListener("click", () => {
      const wasOpen = root.classList.contains("is-open");
      const yBefore = btn.getBoundingClientRect().top;

      const open = root.classList.toggle("is-open");
      btn.textContent = open ? "Свернуть" : "Больше фото";

      if (wasOpen) {
        requestAnimationFrame(() => {
          const yAfter = btn.getBoundingClientRect().top;
          window.scrollBy({ top: yAfter - yBefore, left: 0, behavior: "auto" });
        });
      }
    });
  });
}

function initAutoGalleries() {
  $$("[data-gallery-auto]").forEach((gallery) => {
    const kind = gallery.getAttribute("data-gallery-auto");
    const count = Number(gallery.getAttribute("data-gallery-count") || "0");
    const ext = (gallery.getAttribute("data-gallery-ext") || "jpg").trim();
    const rail = $(".gallery-rail", gallery);
    if (!kind || !count || !rail) return;

    rail.innerHTML = "";

    const frag = document.createDocumentFragment();
    for (let i = 1; i <= count; i++) {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = "";
      img.src = `assets/${kind}-${i}.${ext}`;
      frag.appendChild(img);
    }
    rail.appendChild(frag);
  });
}

function initLightbox() {
  const lightbox = $("[data-lightbox]");
  const imgEl = $("[data-lightbox-img]");
  const btnPrev = $("[data-lightbox-prev]");
  const btnNext = $("[data-lightbox-next]");
  const closers = $$("[data-lightbox-close]");
  if (!lightbox || !imgEl || !btnPrev || !btnNext) return;

  let items = [];
  let index = 0;
  let lastActive = null;

  const setOpen = (open) => {
    lightbox.hidden = !open;
    lightbox.setAttribute("aria-hidden", open ? "false" : "true");
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open && lastActive) lastActive.focus();
  };

  const render = () => {
    if (!items.length) return;
    const src = items[index].getAttribute("src");
    imgEl.src = src;
    imgEl.alt = items[index].getAttribute("alt") || "";
  };

  const openAt = (i, fromEl, newItems) => {
    lastActive = fromEl || document.activeElement;
    if (Array.isArray(newItems) && newItems.length) items = newItems;
    if (!items.length) return;
    index = ((i % items.length) + items.length) % items.length;
    render();
    setOpen(true);
  };

  const prev = () => openAt(index - 1);
  const next = () => openAt(index + 1);

  document.addEventListener("click", (e) => {
    const img = e.target instanceof HTMLElement ? e.target.closest("[data-gallery] img") : null;
    if (!img) return;
    const gallery = img.closest("[data-gallery]");
    if (!gallery) return;
    const rail = $(".gallery-rail", gallery) || gallery;
    const imgs = $$("img", rail).filter((i) => i.getAttribute("src"));
    const i = imgs.indexOf(img);
    if (i < 0) return;
    e.preventDefault();
    openAt(i, img, imgs);
  });

  btnPrev.addEventListener("click", (e) => {
    e.preventDefault();
    prev();
  });
  btnNext.addEventListener("click", (e) => {
    e.preventDefault();
    next();
  });
  closers.forEach((c) =>
    c.addEventListener("click", (e) => {
      e.preventDefault();
      setOpen(false);
    })
  );

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") setOpen(false);
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  });
}


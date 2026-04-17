function initGallery() {
  $$("[data-gallery]").forEach((root) => {
    const btn = $("[data-gallery-more]", root);
    if (!btn) return;
    btn.addEventListener("click", () => {
      const wasOpen = root.classList.contains("is-open");
      const yBefore = btn.getBoundingClientRect().top;

      const open = root.classList.toggle("is-open");
      btn.textContent = open ? "Свернуть" : "Больше фото";

      // When collapsing, page height changes резко and browser can "jump" вниз.
      // Keep the button in the same visual place in the viewport.
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
    const grid = $(".gallery__grid", gallery);
    if (!kind || !count || !grid) return;

    // Prevent duplicate rendering if init runs more than once
    grid.innerHTML = "";

    const frag = document.createDocumentFragment();
    for (let i = 1; i <= count; i++) {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.alt = "";
      img.src = `assets/${kind}-${i}.${ext}`;
      frag.appendChild(img);
    }
    grid.appendChild(frag);
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
    const grid = $(".gallery__grid", gallery) || gallery;
    const imgs = $$("img", grid).filter((i) => i.getAttribute("src"));
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


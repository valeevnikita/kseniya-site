function setYear() {
  const el = $("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

function initMenu() {
  const header = $("[data-header]");
  const menu = $("[data-menu]");
  const btn = $("[data-menu-button]");
  const closers = $$("[data-menu-close]");

  if (!header || !menu || !btn) return;

  const setOpen = (open) => {
    header.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    document.documentElement.style.overflow = open ? "hidden" : "";
  };

  btn.addEventListener("click", () => setOpen(menu.getAttribute("aria-hidden") !== "false"));
  closers.forEach((c) => c.addEventListener("click", () => setOpen(false)));
  $$(".menu__link", menu).forEach((link) => link.addEventListener("click", () => setOpen(false)));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

function initSplash() {
  const splash = $("[data-splash]");
  if (!splash) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const showTextWhenFontsReady = () => {
    const mark = () => splash.classList.add("is-fonts-ready");
    // If Font Loading API is supported, wait for all fonts to be ready to avoid style "jump"
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(mark).catch(mark);
    } else {
      mark();
    }
  };

  const hide = () => {
    splash.classList.add("is-hidden");
    setTimeout(() => splash.remove(), 900);
  };

  if (prefersReduced) {
    splash.remove();
    return;
  }

  showTextWhenFontsReady();
  splash.addEventListener("click", hide);
  setTimeout(hide, 2000);
}

function initScrollReveal() {
  const targets = $$("[data-animate]");
  if (!targets.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        if (entry.target.hasAttribute("data-mixer")) {
          entry.target.classList.add("is-spinning");
        }
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
  );

  targets.forEach((t) => io.observe(t));
}

function initMixerImageFallback() {
  const wrap = $("[data-mixer]");
  if (!wrap) return;
  const img = $("[data-mixer-img]", wrap);
  if (!img) return;

  const enableImg = () => wrap.classList.add("has-img");
  const disableImg = () => wrap.classList.remove("has-img");

  // Prefer real image immediately; fallback only if it fails to load.
  enableImg();

  img.addEventListener("load", enableImg);
  img.addEventListener("error", disableImg);

  // If cached / already loaded
  if (img.complete && img.naturalWidth > 0) {
    enableImg();
    return;
  }

  // More reliable than checking naturalWidth immediately (some browsers update it later)
  if (img.decode) {
    img
      .decode()
      .then(enableImg)
      .catch(() => {});
  }
}

function initParrotFallback() {
  const parrot = $("[data-parrot]");
  if (!parrot) return;
  parrot.addEventListener("error", () => {
    parrot.src = "assets/party-parrot.svg";
  });
}


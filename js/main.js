const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let quizApi = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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

  const hide = () => {
    splash.classList.add("is-hidden");
    setTimeout(() => splash.remove(), 900);
  };

  if (prefersReduced) {
    splash.remove();
    return;
  }

  requestAnimationFrame(() => {
    splash.classList.add("is-shown");
  });

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

function initModal() {
  const modal = $("[data-modal]");
  const content = $("[data-modal-content]");
  const closeEls = $$("[data-modal-close]");
  if (!modal || !content) return;

  const setOpen = (open) => {
    modal.setAttribute("aria-hidden", open ? "false" : "true");
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open) content.innerHTML = "";
  };

  closeEls.forEach((el) => el.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  const openVideo = (src) => {
    if (!src) return;
    const isYouTube = /youtube\.com|youtu\.be/.test(src);
    const isVimeo = /vimeo\.com/.test(src);

    if (isYouTube || isVimeo) {
      const iframe = document.createElement("iframe");
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.src = src;
      content.appendChild(iframe);
    } else {
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.src = src;
      content.appendChild(video);
      video.addEventListener("error", () => {
        content.innerHTML = `
          <div class="video-fallback">
            <p><strong>Видео пока не добавлено.</strong></p>
            <p class="muted">Замените значение <code>data-video</code> у карточки на ссылку YouTube/Vimeo или на путь к вашему файлу.</p>
          </div>
        `;
      });
      video.play().catch(() => {});
    }

    setOpen(true);
  };

  $$("[data-video]").forEach((card) => {
    const src = card.getAttribute("data-video");
    const play = $(".video-card__play", card);

    const handler = (e) => {
      e.preventDefault();
      openVideo(src);
    };

    card.addEventListener("click", handler);
    if (play) play.addEventListener("click", handler);
  });
}

function initGallery() {
  const root = $("[data-gallery]");
  const btn = $("[data-gallery-more]");
  if (!root || !btn) return;
  btn.addEventListener("click", () => {
    const open = root.classList.toggle("is-open");
    btn.textContent = open ? "Свернуть" : "Больше фото";
  });
}

function initReviewsSlider() {
  const slider = $("[data-reviews-slider]");
  const track = $("[data-reviews-track]");
  const prev = $("[data-reviews-prev]");
  const next = $("[data-reviews-next]");
  if (!slider || !track || !prev || !next) return;

  const step = (dir) => {
    const card = $(".review-card", track);
    const cardWidth = card ? card.getBoundingClientRect().width : 520;
    const gap = 18;
    track.scrollBy({ left: dir * (cardWidth + gap), behavior: "smooth" });
  };

  prev.addEventListener("click", (e) => {
    e.preventDefault();
    step(-1);
  });
  next.addEventListener("click", (e) => {
    e.preventDefault();
    step(1);
  });
}

function initLightbox() {
  const lightbox = $("[data-lightbox]");
  const imgEl = $("[data-lightbox-img]");
  const btnPrev = $("[data-lightbox-prev]");
  const btnNext = $("[data-lightbox-next]");
  const closers = $$("[data-lightbox-close]");
  const galleryRoot = $("[data-gallery]");
  if (!lightbox || !imgEl || !btnPrev || !btnNext || !galleryRoot) return;

  const grid = $(".gallery__grid", galleryRoot);
  const items = $$("img", grid || galleryRoot).filter((img) => img.getAttribute("src"));
  if (!items.length) return;

  let index = 0;
  let lastActive = null;

  const setOpen = (open) => {
    lightbox.hidden = !open;
    lightbox.setAttribute("aria-hidden", open ? "false" : "true");
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (!open && lastActive) lastActive.focus();
  };

  const render = () => {
    const src = items[index].getAttribute("src");
    imgEl.src = src;
    imgEl.alt = items[index].getAttribute("alt") || "";
  };

  const openAt = (i, fromEl) => {
    lastActive = fromEl || document.activeElement;
    index = ((i % items.length) + items.length) % items.length;
    render();
    setOpen(true);
  };

  const prev = () => openAt(index - 1);
  const next = () => openAt(index + 1);

  items.forEach((img, i) => {
    img.addEventListener("click", (e) => {
      e.preventDefault();
      openAt(i, img);
    });
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

function initFaq() {
  $$(".faq__item").forEach((item) => {
    item.addEventListener("click", () => {
      const expanded = item.getAttribute("aria-expanded") === "true";
      item.setAttribute("aria-expanded", expanded ? "false" : "true");
    });
  });
}

function initQuiz() {
  const form = $("[data-quiz]");
  if (!form) return;

  const steps = $$("[data-quiz-step]", form);
  const next = $("[data-quiz-next]", form);
  const back = $("[data-quiz-back]", form);
  const bar = $("[data-quiz-bar]", form);
  const stepLabel = $("[data-quiz-step-label]", form);
  const formError = $("[data-quiz-form-error]", form);
  const phoneError = $("[data-field-error=\"phone\"]", form);
  const consentError = $("[data-field-error=\"consent\"]", form);
  const resultWrap = $("[data-quiz-result]", form);
  const resultText = $("[data-quiz-text]", form);
  const copyBtn = $("[data-quiz-copy]", form);

  if (
    !steps.length ||
    !next ||
    !back ||
    !bar ||
    !resultWrap ||
    !resultText ||
    !copyBtn ||
    !stepLabel ||
    !formError ||
    !phoneError ||
    !consentError
  )
    return;

  let stepIndex = 0;
  const answers = [];

  const getLeadText = () => {
    const data = new FormData(form);
    const date = data.get("date");
    const city = data.get("city");
    const name = data.get("name");
    const phone = data.get("phone");
    const contactMethod = data.get("contact_method");

    const lines = [
      "Заявка на расчет стоимости",
      "",
      answers.filter(Boolean).join("\n"),
      "",
      `Дата: ${date ? date : "не указана"}`,
      `Город: ${city ? city : "не указан"}`,
      `Имя: ${name ? name : "не указано"}`,
      `Телефон: ${phone ? phone : "не указан"}`,
      `Способ связи: ${contactMethod ? contactMethod : "не указан"}`,
    ];

    return lines.join("\n");
  };

  const sendLead = async (text) => {
    const data = new FormData(form);
    const method = (data.get("contact_method") || "Telegram").toString();

    if (method === "Telegram") {
      const url = `https://t.me/SaiRaks11?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank", "noreferrer");
      return { ok: true, note: "Открыл Telegram с готовым сообщением." };
    }

    if (method === "VK") {
      try {
        await navigator.clipboard.writeText(text);
        window.open("https://vk.com/valeev_73", "_blank", "noreferrer");
        return { ok: true, note: "Текст скопирован. Открыл VK — вставьте сообщение в диалог." };
      } catch {
        window.open("https://vk.com/valeev_73", "_blank", "noreferrer");
        return { ok: true, note: "Открыл VK. Скопируйте текст ниже и отправьте сообщением." };
      }
    }

    if (method === "Звонок") {
      window.location.href = "tel:+79271152333";
      return { ok: true, note: "Открываю звонок." };
    }

    return { ok: false, note: "Выберите способ связи." };
  };

  const updateUI = () => {
    steps.forEach((s, i) => {
      s.hidden = i !== stepIndex;
    });

    back.disabled = stepIndex === 0;

    const progress = ((stepIndex + 1) / steps.length) * 100;
    bar.style.width = `${clamp(progress, 10, 100)}%`;

    const isLast = stepIndex === steps.length - 1;
    next.textContent = isLast ? "Отправить →" : "Следующий вопрос →";
    stepLabel.textContent = `Шаг: ${stepIndex + 1}/${steps.length}`;

    formError.hidden = true;
    phoneError.hidden = true;
    consentError.hidden = true;
    const phoneInput = $("input[name=\"phone\"]", form);
    if (phoneInput) phoneInput.classList.remove("is-error");
    const consentWrap = $(".consent-simple", form);
    if (consentWrap) consentWrap.classList.remove("is-error");

    // Restore selection highlight when returning to previous steps
    const currentStepEl = steps[stepIndex];
    if (currentStepEl) {
      const expected = answers[stepIndex];
      const buttons = $$("[data-choice]", currentStepEl);
      if (buttons.length) {
        buttons.forEach((b) => b.classList.toggle("is-selected", b.getAttribute("data-choice") === expected));
      }
    }
  };

  const validateFinalStep = () => {
    const phoneInput = $("input[name=\"phone\"]", form);
    const consent = $("input[name=\"consent\"]", form);
    const consentWrap = $(".consent-simple", form);

    const digits = (phoneInput?.value || "").replace(/\D/g, "");
    const phoneOk = digits.length >= 11;
    const consentOk = !!consent?.checked;

    phoneError.hidden = phoneOk;
    consentError.hidden = consentOk;
    if (phoneInput) phoneInput.classList.toggle("is-error", !phoneOk);
    if (consentWrap) consentWrap.classList.toggle("is-error", !consentOk);

    const ok = phoneOk && consentOk;
    formError.hidden = ok;
    if (!ok) {
      if (!phoneOk) phoneInput?.focus?.();
      else consent?.focus?.();
    }
    return ok;
  };

  // Live validation on the last step (only after user tries to submit)
  const phoneInput = $("input[name=\"phone\"]", form);
  const consentInput = $("input[name=\"consent\"]", form);
  phoneInput?.addEventListener("input", () => {
    if (stepIndex === steps.length - 1 && !formError.hidden) validateFinalStep();
  });
  consentInput?.addEventListener("change", () => {
    if (stepIndex === steps.length - 1 && !formError.hidden) validateFinalStep();
  });

  const canAdvance = () => {
    if (stepIndex !== steps.length - 1) return true;
    return validateFinalStep();
  };

  const showResult = (text, note) => {
    steps.forEach((s) => (s.hidden = true));
    next.disabled = true;
    back.disabled = true;
    resultText.textContent = note ? `${note}\n\n${text}` : text;
    resultWrap.hidden = false;
    bar.style.width = "100%";
  };

  const selectInStep = (btn) => {
    const stepEl = btn.closest("[data-quiz-step]");
    if (!stepEl) return;
    $$("[data-choice]", stepEl).forEach((b) => b.classList.remove("is-selected"));
    btn.classList.add("is-selected");
  };

  $$("[data-choice]", form).forEach((btn) => {
    btn.addEventListener("click", () => {
      const choice = btn.getAttribute("data-choice");
      answers[stepIndex] = choice;
      selectInStep(btn);
    });
  });

  next.addEventListener("click", () => {
    if (!canAdvance()) return;

    if (stepIndex === steps.length - 1) {
      const text = getLeadText();
      Promise.resolve(sendLead(text)).then((res) => {
        showResult(text, res?.note || "");
      });
      return;
    }

    stepIndex += 1;
    updateUI();
  });

  back.addEventListener("click", () => {
    stepIndex = Math.max(0, stepIndex - 1);
    updateUI();
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(resultText.textContent || "");
      copyBtn.textContent = "Скопировано";
      setTimeout(() => (copyBtn.textContent = "Скопировать"), 1200);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(resultText);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      copyBtn.textContent = "Выделено";
      setTimeout(() => (copyBtn.textContent = "Скопировать"), 1200);
    }
  });

  const goToStep = (index) => {
    resultWrap.hidden = true;
    next.disabled = false;
    back.disabled = false;
    stepIndex = clamp(index, 0, steps.length - 1);
    updateUI();
  };

  quizApi = {
    goToStep,
    goToLastStep: () => goToStep(steps.length - 1),
    focusLastStep: () => {
      goToStep(steps.length - 1);
      const name = $("input[name=\"name\"]", form);
      name?.focus?.();
    },
  };

  // Default method
  const defaultMethod = $("input[name=\"contact_method\"][value=\"Telegram\"]", form);
  if (defaultMethod && !$("input[name=\"contact_method\"]:checked", form)) defaultMethod.checked = true;

  updateUI();
}

function initCalcFab() {
  const fab = $("[data-fab]");
  if (!fab) return;

  fab.addEventListener("click", (e) => {
    e.preventDefault();
    const quiz = $("#quiz");
    if (quiz) quiz.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      quizApi?.focusLastStep?.();
    }, 350);
  });
}

function initSelectedStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .choice.is-selected, .radio.is-selected {
      border-color: rgba(255, 230, 0, 0.55) !important;
      box-shadow: 0 0 0 4px rgba(255, 230, 0, 0.12);
      background: rgba(255, 255, 255, 0.05) !important;
    }
  `;
  document.head.appendChild(style);
}

setYear();
initSelectedStyles();
initMenu();
initSplash();
initScrollReveal();
initMixerImageFallback();
initParrotFallback();
initModal();
initGallery();
initReviewsSlider();
initLightbox();
initFaq();
initQuiz();
initCalcFab();

function initCalcFab() {
  const fab = $("[data-fab]");
  if (!fab) return;

  fab.addEventListener("click", (e) => {
    e.preventDefault();
    const quiz = $("#quiz");
    if (quiz) quiz.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      quizApi?.focusFirstStep?.();
    }, 350);
  });
}

function initQuizGiftPreviews() {
  const root = $("[data-quiz]");
  if (!root) return;

  const items = $$("[data-quiz-step=\"0\"] .choice", root);
  if (!items.length) return;

  const warmup = (btn) => {
    const video = $(".choice__preview", btn);
    if (!video) return;
    const src = video.getAttribute("data-src");
    if (!src) return;
    if (!video.getAttribute("src")) video.src = src;
  };

  items.forEach((btn) => {
    const video = $(".choice__preview", btn);
    const media = $(".choice__media", btn);
    if (video) {
      video.addEventListener("error", () => {
        btn.classList.remove("is-preview-playing");
      });
    }

    if (media) {
      const open = (e) => {
        e.preventDefault();
        e.stopPropagation();
        warmup(btn);
        const src = video?.getAttribute("data-src") || video?.getAttribute("src") || "";
        if (!src) return;
        if (typeof window.__openVideoModal === "function") window.__openVideoModal(src);
      };

      media.addEventListener("click", open);
      media.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") open(e);
      });
      media.setAttribute("tabindex", "0");
      media.setAttribute("role", "button");
      media.setAttribute("aria-label", "Открыть видео");
    }
  });
}

function initSelectedStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .choice.is-selected, .radio.is-selected {
      border-color: rgba(229, 168, 17, 0.55) !important;
      box-shadow: 0 0 0 4px rgba(229, 168, 17, 0.12);
      background: rgba(255, 255, 255, 0.05) !important;
    }
  `;
  document.head.appendChild(style);
}


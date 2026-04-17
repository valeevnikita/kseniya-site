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
    const method = (data.get("contact_method") || "VK").toString();

    if (method === "VK") {
      try {
        await navigator.clipboard.writeText(text);
        window.open("https://vk.com/ksu173", "_blank", "noreferrer");
        return { ok: true, note: "Текст скопирован. Открыл VK — вставьте сообщение в диалог." };
      } catch {
        window.open("https://vk.com/ksu173", "_blank", "noreferrer");
        return { ok: true, note: "Открыл VK. Скопируйте текст ниже и отправьте сообщением." };
      }
    }

    if (method === "Звонок") {
      window.location.href = "tel:+79278356376";
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
    focusFirstStep: () => {
      goToStep(0);
      const first = $("[data-quiz-step=\"0\"] button", form);
      first?.focus?.();
    },
    focusLastStep: () => {
      goToStep(steps.length - 1);
      const name = $("input[name=\"name\"]", form);
      name?.focus?.();
    },
  };

  // Default method
  const defaultMethod = $("input[name=\"contact_method\"][value=\"VK\"]", form);
  if (defaultMethod && !$("input[name=\"contact_method\"]:checked", form)) defaultMethod.checked = true;

  updateUI();
}


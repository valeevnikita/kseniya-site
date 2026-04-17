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
    // Prevent duplicate players if click fires twice (e.g. on play button + card)
    content.innerHTML = "";
    const isYouTube = /youtube\.com|youtu\.be/.test(src);
    const isVimeo = /vimeo\.com/.test(src);

    const toYouTubeEmbed = (url) => {
      try {
        const u = new URL(url, window.location.href);
        if (/youtu\.be$/.test(u.hostname)) {
          const id = u.pathname.replace(/^\/+/, "").split("/")[0];
          return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
        }
        if (/youtube\.com$/.test(u.hostname) || /youtube-nocookie\.com$/.test(u.hostname)) {
          if (u.pathname.includes("/embed/")) return url;
          const id = u.searchParams.get("v");
          return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
        }
      } catch {}
      return url;
    };

    const toVimeoEmbed = (url) => {
      try {
        const u = new URL(url, window.location.href);
        if (!/vimeo\.com$/.test(u.hostname)) return url;
        if (u.hostname === "player.vimeo.com") return url;
        const id = u.pathname.replace(/^\/+/, "").split("/")[0];
        return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : url;
      } catch {}
      return url;
    };

    setOpen(true);

    const isLikelyEmbed = /^https?:\/\//.test(src) && !/\.(mp4|webm|ogg)(\?.*)?$/.test(src);

    if (isYouTube || isVimeo || isLikelyEmbed) {
      const iframe = document.createElement("iframe");
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.src = isYouTube ? toYouTubeEmbed(src) : isVimeo ? toVimeoEmbed(src) : src;
      content.appendChild(iframe);
      iframe.addEventListener("error", () => {
        content.innerHTML = `
          <div class="video-fallback">
            <p><strong>Не получилось встроить видео.</strong></p>
            <p class="muted">Откройте по ссылке: <a href="${src}" target="_blank" rel="noopener noreferrer">${src}</a></p>
          </div>
        `;
      });
    } else {
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.src = src;
      content.appendChild(video);
      video.addEventListener("error", () => {
        content.innerHTML = `
          <div class="video-fallback">
            <p><strong>Видео пока не добавлено на сайт.</strong></p>
            <p class="muted">Если видео слишком большое для GitHub, загрузите его на YouTube/Vimeo/VK и укажите ссылку в <code>data-video</code>.</p>
          </div>
        `;
      });
      video.play().catch(() => {});
    }
  };

  // Expose for other blocks (e.g. quiz previews)
  window.__openVideoModal = openVideo;

  $$("[data-video]").forEach((card) => {
    const src = card.getAttribute("data-video");
    const play = $(".video-card__play", card);

    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openVideo(src);
    };

    card.addEventListener("click", handler);
    if (play) play.addEventListener("click", handler);
  });
}


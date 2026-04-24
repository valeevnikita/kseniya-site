# PROJECT_CONTEXT — быстрый контекст проекта

Дата обновления: **2026-04-24**

Этот репозиторий — **статический одностраничный сайт‑портфолио** (landing) для ведущей мероприятий **«Ксения Лазарева»**: видео, фото‑галерея, отзывы, блок доверия и квиз «расчет стоимости».

Цель файла: дать краткую «карту проекта», чтобы при следующей работе не перечитывать все файлы заново.

---

## 1) Как запустить / проверить

- Это **pure HTML/CSS/JS** без сборки.
- Точка входа: `index.html` (откройте в браузере).
- Если хотите локальный сервер (удобнее для больших медиа/кеша): любой статический сервер (например, расширение Live Server в VS Code).

---

## 2) Структура репозитория (важное)

```
index.html
.gitignore
assets/
  gallery/ (фото: assets/gallery/gallery-*.jpg)
  icons/ (svg-иконки)
  quiz/ (превью+видео для подарков в квизе)
  reviews/ (изображения отзывов)
  trust/ (логотипы компаний)
  + много медиа в корне assets: wedding-*.mp4/jpg, jubilee-*.mp4/jpg, korp-*.mp4/jpg, graduation-*.jpg и т.д.
css/
  styles.css (только @import остальных)
  base.css header.css hero.css about.css quiz.css pricing.css reviews.css trust.css footer.css modal.css animations.css responsive.css
js/
  main.js (запуск инициализаций)
  lib/dom.js (мини-утилиты $/$$, clamp, глобальная quizApi)
  features/*.js (функциональные модули)
.idea/ (локальные настройки IDE — обычно не трогаем)
events/ (папка-артефакт: внутри только свой `.git` и `.gitattributes`; игнорируется в `.gitignore`)
```

### Про папку `events/`
- `events/` **не участвует** в работе сайта: в ней только вложенный git (`events/.git`) и `events/.gitattributes`.
- Папка игнорируется через `.gitignore` (`events/`), поэтому изменения там не попадут в основной репозиторий.

---

## 3) `index.html` — секции страницы (высокоуровнево)

`index.html` содержит один `main` со следующими ключевыми секциями (по `id`):

- `#top` — hero (заставка, фото, CTA, canvas‑частицы).
- `#works` — видео с мероприятий: категории + горизонтальные «рельсы» карточек; клик открывает модалку.
- `#about` и соседние секции — описание/блоки преимуществ/оборудования (есть «DJ‑микшер» с fallback‑SVG).
- `#gallery` — фото по категориям: wedding/jubilee/graduation/corporate, lightbox.
- `#quiz` — пошаговый квиз с выбором ответов + финальная форма (телефон/согласие), генерация текста заявки.
- `#pricing` — дополнительные услуги/прайс.
- `#reviews` — отзывы с категориями + слайдер + модалка полного текста.
- `#trust` — логотипы компаний/доверие.
- CTA‑секция (желтая) + `#contacts` footer (телефон, VK).

В `<head>`:
- Google Fonts (Inter + Cormorant Garamond).
- Единственный подключаемый CSS: `css/styles.css` (внутри — `@import` всех остальных).

В конце `body` подключаются скрипты (все `defer`) в порядке:
1) `js/lib/dom.js`
2) `js/features/*.js`
3) `js/main.js` (сразу вызывает `init*()`).

---

## 4) CSS: как устроено

- `css/styles.css` — **агрегатор импортов** (сам стилей почти не содержит).
- `css/base.css` — переменные в `:root` (цвета, радиусы, шрифты), reset/база, контейнеры, общие `.section`, `.btn`, типографика.
- Остальные файлы — по блокам: `header.css`, `hero.css`, `quiz.css`, `reviews.css`, `modal.css`, `responsive.css` и т.д.

Ключевые темы:
- Цветовая схема — dark, акцент `--yellow`.
- Классы в стиле «BEM‑лайт» (`hero__grid`, `review-card__name` и т.п.).

---

## 5) JS: точка входа и модули

### `js/main.js`
Содержит только последовательные вызовы:
`setYear()`, `initMenu()`, `initSplash()`, `initScrollReveal()`, `initMixerImageFallback()`, `initParrotFallback()`, `initModal()`,
`initVideoCats()`, `initVideoRails()`, `initGalleryCats()`, `initAutoGalleries()`, `initGallery()`, `initReviewsSlider()`,
`initReviewsCats()`, `initReviewModal()`, `initLightbox()`, `initQuiz()`, `initCalcFab()`, `initQuizGiftPreviews()`,
`initHeroParticles()`.

Важно: т.к. скрипты `defer`, DOM уже распарсен к моменту запуска `main.js`.

### `js/lib/dom.js`
- `$()` и `$$()` — querySelector/querySelectorAll.
- `clamp()` — утилита.
- `quizApi` — глобальный объект‑API (заполняется в `initQuiz()` и используется в `initCalcFab()`).

### `js/features/core.js`
- `setYear()` — подставляет год в `[data-year]`.
- `initMenu()` — бургер‑меню (`data-header`, `data-menu`, `data-menu-button`, `data-menu-close`), блокирует скролл при открытии.
- `initSplash()` — заставка `data-splash` (таймер ~2с, клик — закрыть; уважает `prefers-reduced-motion`; ждёт `document.fonts.ready`).
- `initScrollReveal()` — анимации появления по `data-animate` через `IntersectionObserver`.
- `initMixerImageFallback()` — для блока `data-mixer`: пытается показать `<img data-mixer-img>`, иначе оставляет SVG‑fallback.
- `initParrotFallback()` — если GIF не грузится, подменяет на `assets/party-parrot.svg` (элемент `data-parrot`).

### `js/features/modal.js`
- `initModal()` — универсальная модалка `data-modal`/`data-modal-content`.
- Открывает видео по клику на карточки `[data-video]`:
  - mp4/webm/ogg → `<video controls>`
  - ссылки/похоже на embed → `<iframe>` (поддержка YouTube/Vimeo + «likely embed»)
- Экспортирует `window.__openVideoModal(src)` для других блоков (например, превью в квизе).

### `js/features/video.js`
- `initVideoCats()` — табы категорий видео (`data-video-cats`, `data-video-cat`, `data-video-panel`).
- `initVideoRails()` — горизонтальная прокрутка рельс (`data-video-rail-wrap`, `data-video-rail`, `data-rail-prev/next`) + disable кнопок на краях.

### `js/features/tabs.js`
- `initGalleryCats()` — табы фото (`data-gallery-cats`, `data-gallery-cat`, `data-gallery-panel`), плюс сброс состояния «Больше фото».
- `initReviewsCats()` — табы отзывов (`data-reviews-cats`, `data-reviews-cat`, `data-reviews-panel`) и событие `tabs:changed` для синхронизации слайдера.

### `js/features/gallery.js`
- `initGallery()` — кнопка «Больше фото/Свернуть» (`data-gallery`, `data-gallery-more`), с защитой от «прыжка» страницы при сворачивании.
- `initAutoGalleries()` — автогенерация `<img>` по паттерну `assets/{kind}-{i}.{ext}`:
  - в HTML задаётся `data-gallery-auto`, `data-gallery-count`, `data-gallery-ext`.
  - сейчас используется для `graduation` (42) и `korp` (17).
- `initLightbox()` — лайтбокс `data-lightbox` + навигация `data-lightbox-prev/next`, закрытие `data-lightbox-close`, клавиши Esc/←/→.

### `js/features/reviews.js`
- `initReviewsSlider()` — горизонтальный слайдер карточек отзывов, кнопки `data-reviews-prev/next`, корректная работа при смене табов.
- `initReviewModal()` — модалка полного текста отзыва (`data-review-modal`, `data-review-modal-*`, `data-review-close`):
  - открывается только если карточка «expandable»
  - инициалы генерятся автоматически, если нет фото.

### `js/features/quiz.js`
- `initQuiz()` — пошаговый квиз `data-quiz`:
  - шаги `data-quiz-step`, выбор кнопками `data-choice`
  - прогрессбар `data-quiz-bar`, кнопки `data-quiz-next/back`
  - финальная валидация: телефон (>= 11 цифр) + чекбокс согласия
  - формирует текст заявки (answers + дата/город/имя/телефон/способ связи)
  - «Отправка»:
    - VK → пытается скопировать в clipboard и открывает `https://vk.com/ksu173`
    - Звонок → `tel:+79278356376`
  - заполняет глобальный `quizApi` (`goToStep`, `focusFirstStep`, `focusLastStep`).

### `js/features/quiz-extras.js`
- `initCalcFab()` — плавающая кнопка `data-fab`: скроллит к `#quiz` и фокусирует первый шаг через `quizApi`.
- `initQuizGiftPreviews()` — в первом шаге квиза делает кликабельным превью (video `data-src`) и открывает его через `window.__openVideoModal`.
- `initSelectedStyles()` — добавляет `<style>` для подсветки выбранных `.choice/.radio`.

### `js/features/particles-hero.js`
- `initHeroParticles()` — canvas‑анимация шариков на hero (`data-hero-particles`), уважает `prefers-reduced-motion`, пауза при скрытой вкладке.

---

## 6) «Селекторы‑контракты» (data-атрибуты)

Этот проект держится на `data-*` как на стабильном API между HTML и JS. Если переименовывать — править соответствующий модуль.

Ключевые группы:
- Меню: `data-header`, `data-menu`, `data-menu-button`, `data-menu-close`.
- Splash: `data-splash`.
- Видео: `data-video`, `data-video-cats`, `data-video-cat`, `data-video-panel`, `data-video-rail-wrap`, `data-video-rail`, `data-rail-prev`, `data-rail-next`.
- Галерея: `data-gallery-cats`, `data-gallery-cat`, `data-gallery-panel`, `data-gallery`, `data-gallery-more`, `data-gallery-auto`, `data-gallery-count`, `data-gallery-ext`.
- Lightbox: `data-lightbox`, `data-lightbox-img`, `data-lightbox-prev/next`, `data-lightbox-close`.
- Отзывы: `data-reviews-cats`, `data-reviews-cat`, `data-reviews-panel`, `data-reviews-track`, `data-reviews-prev/next`,
  `data-review-modal`, `data-review-modal-avatar/name/text`, `data-review-close`.
- Квиз: `data-quiz`, `data-quiz-step`, `data-choice`, `data-quiz-next/back`, `data-quiz-bar`, `data-quiz-step-label`,
  `data-quiz-form-error`, `data-field-error="phone|consent"`, `data-quiz-result`, `data-quiz-text`, `data-quiz-copy`.
- Прочее: `data-hero-particles`, `data-mixer`, `data-mixer-img`, `data-mixer-fallback`, `data-parrot`, `data-animate`, `data-fab`, `data-year`.

---

## 7) Ассеты: соглашения по именам (важно для автогенерации)

- Автогалереи (`initAutoGalleries`) ожидают файлы: `assets/{kind}-{1..N}.{ext}`.
  - Примеры в проекте: `assets/graduation-1.jpg ... graduation-42.jpg`, `assets/korp-1.jpg ... korp-17.jpg`.
- Видео‑карточки в `#works` указывают `data-video="assets/....mp4"` (или URL на YouTube/Vimeo).
- Фото‑галерея wedding использует: `assets/gallery/gallery-*.jpg`.
- Превью/видео подарков в квизе: `assets/quiz/quiz-gift-*.jpg` и `assets/quiz/quiz-gift-*.mp4`.

---

## 8) Быстрые «куда идти править»

- Текст/контент/секции: `index.html`.
- Стили конкретного блока: соответствующий файл в `css/` (см. импорты в `css/styles.css`).
- Поведение:
  - меню/заставка/scroll‑reveal/fallback: `js/features/core.js`
  - видео+модалка: `js/features/video.js`, `js/features/modal.js`
  - фото+lightbox: `js/features/tabs.js`, `js/features/gallery.js`
  - отзывы: `js/features/reviews.js`, `js/features/tabs.js`
  - квиз: `js/features/quiz.js`, `js/features/quiz-extras.js`
  - частицы hero: `js/features/particles-hero.js`
- Контакты (VK/телефон): `index.html` + логика «отправки» в `js/features/quiz.js`.


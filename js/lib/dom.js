const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

let quizApi = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}


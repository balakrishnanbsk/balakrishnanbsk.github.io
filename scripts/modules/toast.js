/** A single toast element, reused. */

let timer = 0;

export function toast(message) {
  const el = document.getElementById('toast');
  const text = document.getElementById('toastText');
  if (!el || !text) return;
  text.textContent = message;
  el.classList.remove('is-visible');
  void el.offsetWidth;
  el.classList.add('is-visible');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('is-visible'), 2200);
}

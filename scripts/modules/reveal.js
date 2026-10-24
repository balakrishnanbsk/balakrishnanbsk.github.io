/**
 * Scroll reveal — one observer for the whole page, unobserving as it goes.
 * Elements are visible by default if this never runs.
 */

export function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );

  targets.forEach((el, i) => {
    // Siblings revealed together get a short stagger, capped so nothing drags
    const delay = Math.min(i % 4, 3) * 70;
    el.style.setProperty('--reveal-delay', `${delay}ms`);
    io.observe(el);
  });
}

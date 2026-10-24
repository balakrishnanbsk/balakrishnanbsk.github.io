/**
 * Experience timeline — expandable roles, a rail that fills with scroll,
 * and an active role that tracks the viewport.
 */

export function initExperience() {
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  const rail = document.getElementById('timelineRail');
  const roles = [...timeline.querySelectorAll('[data-role]')];

  /* ---- Expand / collapse ---- */
  roles.forEach((role) => {
    const btn = role.querySelector('.role__summary');
    const detail = role.querySelector('.role__detail');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      detail.classList.toggle('is-open', !open);
      if (!open) role.classList.add('is-active');
    });
  });

  /* ---- Rail fill ---- */
  let ticking = false;
  const update = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = timeline.getBoundingClientRect();
      const anchor = innerHeight * 0.45;
      const progress = (anchor - rect.top) / rect.height;
      rail?.style.setProperty('--fill', Math.max(0, Math.min(1, progress)).toFixed(4));
      ticking = false;
    });
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();

  /* ---- Active role ---- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-active', e.isIntersecting)),
      { rootMargin: '-25% 0px -45% 0px', threshold: 0 }
    );
    roles.forEach((r) => io.observe(r));
  }
}

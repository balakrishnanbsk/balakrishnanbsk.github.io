/**
 * Navigation — sticky header state, scroll progress, active section,
 * sliding desktop indicator and the mobile sheet.
 */

const SECTIONS = ['about', 'experience', 'work', 'skills', 'process', 'contact'];

export function initNav() {
  const header = document.getElementById('siteHeader');
  const bar = document.getElementById('progressBar');
  const indicator = document.getElementById('navIndicator');
  const desktopLinks = [...document.querySelectorAll('.nav__link')];
  const mobileLinks = [...document.querySelectorAll('.mobile-nav__link')];

  /* ---- Scroll progress + stuck header (one rAF-throttled handler) ---- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
      bar.style.setProperty('--p', p.toFixed(4));
      header.classList.toggle('is-stuck', scrollY > 24);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Active section ---- */
  const setActive = (id) => {
    [...desktopLinks, ...mobileLinks].forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`;
      if (on) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    moveIndicator();
  };

  const moveIndicator = () => {
    if (!indicator || innerWidth < 900) return;
    const active = desktopLinks.find((a) => a.getAttribute('aria-current') === 'true');
    if (!active) { indicator.classList.remove('is-on'); return; }
    const list = active.closest('.nav__list');
    const x = active.offsetLeft - list.offsetLeft;
    indicator.style.setProperty('--x', `${x}px`);
    indicator.style.setProperty('--w', `${active.offsetWidth}px`);
    indicator.classList.add('is-on');
  };

  if ('IntersectionObserver' in window) {
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.intersectionRatio));
        let best = null, bestRatio = 0;
        seen.forEach((ratio, id) => { if (ratio > bestRatio) { bestRatio = ratio; best = id; } });
        if (best && bestRatio > 0.02) setActive(best);
        else if (scrollY < 120) setActive(null);
      },
      { threshold: [0, 0.03, 0.2, 0.5, 0.9], rootMargin: '-15% 0px -45% 0px' }
    );
    SECTIONS.forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  addEventListener('resize', moveIndicator);

  /* ---- Mobile sheet ---- */
  const burger = document.getElementById('burger');
  const sheet = document.getElementById('mobileNav');
  let lastFocused = null;

  const openSheet = () => {
    lastFocused = document.activeElement;
    sheet.hidden = false;
    // Next frame so the transition has a starting state to animate from
    requestAnimationFrame(() => sheet.classList.add('is-open'));
    burger.setAttribute('aria-expanded', 'true');
    burger.querySelector('.sr-only').textContent = 'Close menu';
    document.body.style.overflow = 'hidden';
    sheet.querySelector('.mobile-nav__link')?.focus({ preventScroll: true });
  };

  const closeSheet = ({ restoreFocus = true } = {}) => {
    sheet.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.querySelector('.sr-only').textContent = 'Open menu';
    document.body.style.overflow = '';
    const done = () => { sheet.hidden = true; };
    setTimeout(done, 320);
    if (restoreFocus) (lastFocused instanceof HTMLElement ? lastFocused : burger).focus({ preventScroll: true });
  };

  burger?.addEventListener('click', () => {
    burger.getAttribute('aria-expanded') === 'true' ? closeSheet() : openSheet();
  });

  mobileLinks.forEach((a) => a.addEventListener('click', () => closeSheet({ restoreFocus: false })));

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger?.getAttribute('aria-expanded') === 'true') closeSheet();
  });

  // Keep focus inside the sheet while it is open
  sheet?.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = sheet.querySelectorAll('a[href], button:not([disabled])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  addEventListener('resize', () => {
    if (innerWidth >= 900 && burger?.getAttribute('aria-expanded') === 'true') closeSheet({ restoreFocus: false });
  });
}

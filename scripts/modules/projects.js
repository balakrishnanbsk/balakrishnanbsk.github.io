/**
 * Projects — filtering, the pointer-follow wash, a touch "peek" step
 * before opening, and the case-study dialog.
 */

import { motionEnabled } from './prefs.js';

export function initProjects() {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;

  const cards = [...grid.querySelectorAll('.project')];
  const count = document.getElementById('projectCount');
  const filterBar = document.getElementById('projectFilter');
  const touch = !matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- Filtering ---- */
  filterBar?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    const filter = btn.dataset.filter;
    filterBar.querySelectorAll('[data-filter]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b === btn))
    );
    let shown = 0;
    cards.forEach((card) => {
      // A project can sit in more than one track, e.g. tooling that is also open source
      const tracks = (card.dataset.track || '').split(' ').filter(Boolean);
      const on = filter === 'all' || tracks.includes(filter);
      card.hidden = !on;
      card.classList.remove('is-peeking');
      if (on) shown++;
    });
    if (count) count.textContent = `${shown} project${shown === 1 ? '' : 's'}`;
  });

  /* ---- Pointer wash + peek ---- */
  cards.forEach((card) => {
    const button = card.querySelector('.project__card');

    button.addEventListener('pointermove', (e) => {
      if (!motionEnabled() || e.pointerType !== 'mouse') return;
      const r = button.getBoundingClientRect();
      button.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      button.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    }, { passive: true });

    button.addEventListener('click', (e) => {
      // On touch, the first tap previews and the second opens the case study
      if (touch && !card.classList.contains('is-peeking') && card.querySelector('.project__peek')) {
        e.preventDefault();
        cards.forEach((c) => c.classList.remove('is-peeking'));
        card.classList.add('is-peeking');
        return;
      }
      openCase(button.dataset.case, button);
    });
  });

  /* ---- Case-study dialog ---- */
  const dialog = document.getElementById('caseModal');
  const content = document.getElementById('caseModalContent');
  const panel = document.getElementById('caseModalPanel');
  const closeBtn = document.getElementById('caseClose');
  let opener = null;

  function openCase(id, from) {
    const source = document.getElementById(id);
    if (!source || !dialog) return;
    opener = from;
    content.replaceChildren(source.cloneNode(true));
    const clone = content.firstElementChild;
    clone.removeAttribute('id');
    clone.hidden = false;
    dialog.setAttribute('aria-label', `${clone.querySelector('.case__title')?.textContent || 'Project'} — case study`);
    panel.scrollTop = 0;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    closeBtn.focus({ preventScroll: true });
  }

  closeBtn?.addEventListener('click', () => dialog.close());

  // Click outside the panel closes, as people expect from a modal
  dialog?.addEventListener('click', (e) => {
    if (!panel.contains(e.target)) dialog.close();
  });

  dialog?.addEventListener('close', () => {
    document.body.style.overflow = '';
    content.replaceChildren();
    opener?.focus({ preventScroll: true });
    opener = null;
  });
}

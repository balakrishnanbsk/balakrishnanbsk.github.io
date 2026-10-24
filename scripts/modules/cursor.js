/**
 * Cursor — a small dot with a trailing ring, plus magnetic buttons.
 * Fine pointers only; never interferes with the real cursor's job.
 */

import { motionEnabled } from './prefs.js';

export function initCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let x = innerWidth / 2, y = innerHeight / 2;
  let rx = x, ry = y;
  let raf = 0;

  const HOT = 'a[href], button, [role="tab"], summary, .tech, .map__node';

  const loop = () => {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    raf = requestAnimationFrame(loop);
  };

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x = e.clientX; y = e.clientY;
    document.body.classList.add('has-cursor');
    if (!raf) raf = requestAnimationFrame(loop);

    const target = e.target.closest?.(HOT);
    document.body.classList.toggle('cursor-hot', !!target);
    document.body.classList.toggle('cursor-hot-lg', !!e.target.closest?.('.project__card'));
  }, { passive: true });

  addEventListener('pointerdown', () => document.body.classList.add('cursor-down'));
  addEventListener('pointerup', () => document.body.classList.remove('cursor-down'));
  document.addEventListener('mouseleave', () => document.body.classList.remove('has-cursor'));
  document.addEventListener('mouseenter', () => document.body.classList.add('has-cursor'));
}

/** Buttons lean very slightly toward the pointer — 4px, not a trampoline. */
export function initMagnetic() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.querySelectorAll('.magnetic').forEach((el) => {
    let frame = 0;
    const move = (e) => {
      if (!motionEnabled()) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate(${(dx * 8).toFixed(2)}px, ${(dy * 5).toFixed(2)}px)`;
      });
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      el.style.transform = '';
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
  });
}

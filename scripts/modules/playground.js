/**
 * Playground + theme toggle — every control writes a design token.
 */

import { prefs, setPref, resetPrefs, effectiveTheme, onPrefChange, prefersReducedMotion } from './prefs.js';
import { toast } from './toast.js';

export function initPlayground() {
  const groups = [
    { el: document.getElementById('themeControl'), attr: 'themeChoice', key: 'theme' },
    { el: document.getElementById('motionControl'), attr: 'motionChoice', key: 'motion' },
    { el: document.getElementById('densityControl'), attr: 'densityChoice', key: 'density' },
    { el: document.getElementById('accentControl'), attr: 'accentChoice', key: 'accent' }
  ];

  groups.forEach(({ el, attr, key }) => {
    el?.addEventListener('click', (e) => {
      const btn = e.target.closest(`[data-${camelToDash(attr)}]`);
      if (!btn) return;
      setPref(key, btn.dataset[attr]);
    });
  });

  function syncControls() {
    groups.forEach(({ el, attr, key }) => {
      el?.querySelectorAll(`[data-${camelToDash(attr)}]`).forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset[attr] === prefs[key]))
      );
    });

    // Be honest when the OS has already decided motion for us
    const motionGroup = document.getElementById('motionControl');
    if (motionGroup) {
      const forced = prefersReducedMotion();
      motionGroup.querySelectorAll('button').forEach((b) => { b.disabled = forced; });
      motionGroup.title = forced ? 'Your system asks for reduced motion, so motion stays off.' : '';
    }
  }

  document.getElementById('resetPrefs')?.addEventListener('click', () => {
    resetPrefs();
    syncControls();
    syncThemeToggle();
    toast('Preferences reset');
  });

  /* ---- Header theme toggle ---- */
  const toggle = document.getElementById('themeToggle');
  const label = document.getElementById('themeToggleLabel');

  function syncThemeToggle() {
    const dark = effectiveTheme() === 'dark';
    if (label) label.textContent = dark ? 'Switch to light theme' : 'Switch to dark theme';
    toggle?.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  toggle?.addEventListener('click', () => {
    setPref('theme', effectiveTheme() === 'dark' ? 'light' : 'dark');
  });

  onPrefChange(() => { syncControls(); syncThemeToggle(); });
  syncControls();
  syncThemeToggle();
}

function camelToDash(s) { return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`); }

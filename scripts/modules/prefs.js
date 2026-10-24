/**
 * Preferences — theme, accent, density, motion.
 * Everything writes to a data-attribute on <html>; CSS does the rest.
 */

const KEY = 'bsk.prefs';
const root = document.documentElement;

const DEFAULTS = { theme: 'system', accent: 'signal', density: 'comfortable', motion: 'full' };

export const prefs = { ...DEFAULTS, ...read() };

function read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* private mode */ }
}

const listeners = new Set();
export function onPrefChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function setPref(key, value) {
  if (prefs[key] === value) return;
  prefs[key] = value;
  apply();
  persist();
  listeners.forEach((fn) => fn(key, value));
}

export function resetPrefs() {
  Object.assign(prefs, DEFAULTS);
  apply();
  persist();
  listeners.forEach((fn) => fn('*', null));
}

/** Resolve "system" to the value actually in effect right now. */
export function effectiveTheme() {
  if (prefs.theme !== 'system') return prefs.theme;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function prefersReducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True when choreography should run at all. */
export function motionEnabled() {
  return !prefersReducedMotion() && prefs.motion !== 'still';
}

export function apply() {
  if (prefs.theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = prefs.theme;

  if (prefs.accent === 'signal') delete root.dataset.accent;
  else root.dataset.accent = prefs.accent;

  if (prefs.density === 'comfortable') delete root.dataset.density;
  else root.dataset.density = prefs.density;

  if (prefs.motion === 'full') delete root.dataset.motion;
  else root.dataset.motion = prefs.motion;

  // Keep the browser chrome in step with the chosen theme, not just the
  // system one, by switching which theme-color meta is allowed to match.
  const dark = effectiveTheme() === 'dark';
  const light = document.getElementById('themeColorLight');
  const night = document.getElementById('themeColorDark');
  if (light && night) {
    light.media = dark ? 'not all' : 'all';
    night.media = dark ? 'all' : 'not all';
  }
}

// Follow the system when the visitor has not expressed a preference.
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (prefs.theme === 'system') { apply(); listeners.forEach((fn) => fn('theme', 'system')); }
});

matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => {
  listeners.forEach((fn) => fn('motion', prefs.motion));
});

apply();

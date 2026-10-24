/**
 * Portfolio — Balasudharsanakrishnan B
 * Composition root. Every feature is a module that fails quietly on its own.
 */

import { initReveal } from './modules/reveal.js';
import { initNav } from './modules/nav.js';
import { initCursor, initMagnetic } from './modules/cursor.js';
import { initCareerMap } from './modules/career-map.js';
import { initTabs } from './modules/tabs.js';
import { initExperience } from './modules/experience.js';
import { initProjects } from './modules/projects.js';
import { initSkills } from './modules/skills.js';
import { initPlayground } from './modules/playground.js';
import { initClipboard } from './modules/clipboard.js';

const boot = [
  initReveal,
  initNav,
  initExperience,
  initProjects,
  initSkills,
  initPlayground,
  initClipboard,
  initCursor,
  initMagnetic,
  () => initTabs('#facetTabs'),
  () => initTabs('#processTabs'),
  initCareerMap
];

for (const start of boot) {
  try { start(); }
  catch (err) { console.error('[portfolio] module failed:', err); }
}

document.getElementById('year').textContent = String(new Date().getFullYear());

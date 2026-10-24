/**
 * Career map — a canvas constellation of real roles, craft and tools.
 *
 * The canvas is decoration; the interaction lives in real <button>s laid
 * over it, so the map is keyboard operable and announced to screen readers.
 */

import { motionEnabled } from './prefs.js';

const NODES = [
  {
    id: 'me', ring: 0, angle: 0, label: 'BSK',
    kind: 'Overview', title: 'Balasudharsanakrishnan B',
    body: 'Senior UI/Frontend Engineer in Chennai, eight years into enterprise SaaS.'
  },

  /* Companies */
  { id: 'zoho', ring: 1, angle: -90, label: 'Zoho',
    kind: 'Company · Mar 2020 — Present', title: 'Zoho Corporation',
    body: 'Web Developer (senior-level) on ServiceDesk Plus — UI revamp, component library, build pipeline, accessibility.' },
  { id: 'meye', ring: 1, angle: 30, label: 'Meye',
    kind: 'Company · May 2018 — Feb 2020', title: 'Meye Management',
    body: 'Software Developer. Full-stack web and hybrid mobile apps, payments, and an enterprise analytics dashboard.' },
  { id: 'suriya', ring: 1, angle: 150, label: 'Suriya',
    kind: 'Company · Nov 2017 — Feb 2018', title: 'Suriya Informatics Solutions',
    body: 'Java Developer Intern. Backend modules for a student enrolment system in Spring MVC.' },

  /* Craft */
  { id: 'uiarch', ring: 2, angle: -126, label: 'UI architecture',
    kind: 'Craft', title: 'UI architecture',
    body: 'Led the UI revamp of critical ServiceDesk Plus modules across 5+ major workflows.' },
  { id: 'designsys', ring: 2, angle: -72, label: 'Design systems',
    kind: 'Craft', title: 'Design systems',
    body: 'Architected a reusable UI component library used across multiple modules; replaced a Bootstrap-based system with a custom framework.' },
  { id: 'perf', ring: 2, angle: -20, label: 'Performance',
    kind: 'Craft', title: 'Frontend performance',
    body: 'Migrated sprite-based icons to inline SVG URIs, cutting render-blocking requests significantly.' },
  { id: 'a11y', ring: 2, angle: 100, label: 'Accessibility',
    kind: 'Craft', title: 'Accessibility & compatibility',
    body: 'WCAG compliance, cross-browser compatibility and responsive performance across all major browsers.' },
  { id: 'tooling', ring: 2, angle: -170, label: 'Build tooling',
    kind: 'Craft', title: 'Build tooling',
    body: 'Grunt + Node LESS compilation pipeline standardising the build across the entire project.' },
  { id: 'ai', ring: 2, angle: 55, label: 'AI-augmented',
    kind: 'Craft', title: 'AI-augmented development',
    body: 'An MCP-integrated chatbot UI, a custom AI-driven UI framework, and tooling for regression testing and token clean-up.' },

  /* Tools */
  { id: 'js', ring: 3, angle: -103, label: 'JavaScript',
    kind: 'Technology', title: 'JavaScript', body: 'Listed as an expert-level frontend language, alongside HTML5, CSS and TypeScript.' },
  { id: 'ts', ring: 3, angle: -78, label: 'TypeScript',
    kind: 'Technology', title: 'TypeScript', body: 'Part of my expert-level frontend toolkit.' },
  { id: 'less', ring: 3, angle: -52, label: 'LESS',
    kind: 'Technology', title: 'LESS', body: 'The styling layer of ServiceDesk Plus, compiled through the Grunt + Node pipeline I built.' },
  { id: 'grunt', ring: 3, angle: -155, label: 'Grunt',
    kind: 'Technology', title: 'Grunt', body: 'Drives the standardised frontend build, with Node LESS compilation.' },
  { id: 'python', ring: 3, angle: 168, label: 'Python',
    kind: 'Technology', title: 'Python', body: 'Scripting around the frontend, including a design-system colour unification tool.' },
  { id: 'angular', ring: 3, angle: 10, label: 'Angular',
    kind: 'Technology', title: 'Angular', body: 'Used for full-stack web applications at Meye Management.' },
  { id: 'ionic', ring: 3, angle: 38, label: 'Ionic 3',
    kind: 'Technology', title: 'Ionic 3', body: 'Two hybrid mobile apps shipped to the Google Play Store and the Apple App Store.' },
  { id: 'laravel', ring: 3, angle: 66, label: 'Laravel',
    kind: 'Technology', title: 'Laravel / PHP', body: 'REST APIs and backend modules supporting core business logic, plus automated PDF generation.' },
  { id: 'java', ring: 3, angle: 128, label: 'Java',
    kind: 'Technology', title: 'Java · Spring MVC', body: 'Backend modules for a student enrolment system during my internship.' }
];

const LINKS = [
  ['me', 'zoho'], ['me', 'meye'], ['me', 'suriya'],
  ['zoho', 'uiarch'], ['zoho', 'designsys'], ['zoho', 'perf'], ['zoho', 'tooling'], ['zoho', 'a11y'], ['zoho', 'ai'],
  ['meye', 'uiarch'], ['meye', 'angular'], ['meye', 'ionic'], ['meye', 'laravel'],
  ['suriya', 'java'], ['suriya', 'a11y'],
  ['uiarch', 'js'], ['uiarch', 'ts'],
  ['designsys', 'less'], ['designsys', 'js'],
  ['tooling', 'grunt'], ['tooling', 'python'],
  ['perf', 'less'], ['perf', 'grunt'],
  ['ai', 'python']
];

const RADII = [0, 0.175, 0.295, 0.405];

export function initCareerMap() {
  const figure = document.getElementById('careerMap');
  const canvas = document.getElementById('mapCanvas');
  const host = document.getElementById('mapNodes');
  if (!figure || !canvas || !host) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const readout = document.getElementById('mapReadout');
  const elKind = document.getElementById('mapKind');
  const elTitle = document.getElementById('mapTitle');
  const elBody = document.getElementById('mapBody');

  const touch = !matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hint = figure.querySelector('[data-hint-desktop]');
  if (hint && touch) hint.textContent = 'Tap a node';

  const byId = new Map(NODES.map((n) => [n.id, n]));
  const neighbours = new Map(NODES.map((n) => [n.id, new Set()]));
  LINKS.forEach(([a, b]) => { neighbours.get(a).add(b); neighbours.get(b).add(a); });

  let w = 0, h = 0, dpr = 1;
  let active = null;
  let pointer = { x: 0.5, y: 0.5, inside: false };
  let t = 0;
  let raf = 0;
  let visible = true;

  /* ---- Build the accessible overlay ---- */
  const buttons = NODES.map((n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'map__node';
    b.dataset.id = n.id;
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML = `<span class="sr-only">${n.title} — ${n.kind}</span>`;
    const show = () => select(n.id);
    b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(); });
    b.addEventListener('focus', show);
    b.addEventListener('click', (e) => { e.preventDefault(); select(n.id, true); });
    host.appendChild(b);
    return b;
  });

  function select(id, sticky = false) {
    if (active === id && !sticky) return;
    active = id;
    const n = byId.get(id);
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    if (!n) return;
    readout.classList.remove('is-in');
    // Restart the stagger on the readout text
    void readout.offsetWidth;
    elKind.textContent = n.kind;
    elTitle.textContent = n.title;
    elBody.textContent = n.body;
    readout.classList.add('is-in');
  }

  function clear() {
    active = null;
    buttons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
  }

  /* ---- Geometry ---- */
  function position(n) {
    const r = RADII[n.ring];
    const a = (n.angle * Math.PI) / 180;
    // Slow organic drift, and a gentle lean toward the pointer
    const drift = motionEnabled() ? Math.sin(t / 1400 + n.ring * 2 + n.angle) * 0.006 : 0;
    const px = 0.5 + Math.cos(a) * (r + drift);
    const py = 0.5 + Math.sin(a) * (r + drift);
    let ox = 0, oy = 0;
    if (pointer.inside && motionEnabled()) {
      const pull = 0.018 * n.ring;
      ox = (pointer.x - 0.5) * pull;
      oy = (pointer.y - 0.5) * pull;
    }
    return { x: (px + ox) * w, y: (py + oy) * h, r: n.ring };
  }

  function layout() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width; h = rect.height;
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    layoutButtons();
  }

  /* ---- Paint ---- */
  function styles() {
    const cs = getComputedStyle(document.documentElement);
    return {
      line: cs.getPropertyValue('--line-strong').trim() || '#ccc',
      ink: cs.getPropertyValue('--ink').trim() || '#000',
      ink3: cs.getPropertyValue('--ink-3').trim() || '#777',
      ink4: cs.getPropertyValue('--ink-4').trim() || '#999',
      accent: cs.getPropertyValue('--accent').trim() || '#d60036',
      surface: cs.getPropertyValue('--surface').trim() || '#fff'
    };
  }

  let palette = styles();
  const refreshPalette = () => { palette = styles(); };

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const pos = new Map(NODES.map((n) => [n.id, position(n)]));
    const lit = active ? new Set([active, ...neighbours.get(active)]) : null;
    const small = w < 420;

    /* Links */
    LINKS.forEach(([a, b]) => {
      const pa = pos.get(a), pb = pos.get(b);
      const on = lit && lit.has(a) && lit.has(b);
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = on ? palette.accent : palette.line;
      ctx.globalAlpha = on ? 0.85 : lit ? 0.14 : 0.42;
      ctx.lineWidth = on ? 1.4 : 1;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    /* Nodes */
    NODES.forEach((n) => {
      const p = pos.get(n.id);
      const on = !lit || lit.has(n.id);
      const isActive = active === n.id;
      const size = n.ring === 0 ? 7 : n.ring === 1 ? 5 : 3.4;

      if (isActive) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size + 7, 0, Math.PI * 2);
        ctx.fillStyle = palette.accent;
        ctx.globalAlpha = 0.14;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? palette.accent : n.ring <= 1 ? palette.ink : palette.ink4;
      ctx.globalAlpha = on ? 1 : 0.22;
      ctx.fill();

      if (n.ring === 1 || n.ring === 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size + 4, 0, Math.PI * 2);
        ctx.strokeStyle = isActive ? palette.accent : palette.line;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      /* Labels: always through the craft ring; the dense tool ring only
         when it is selected, or when there is room for all of it. */
      const showLabel = n.ring <= 2 || isActive || (lit && lit.has(n.id)) || (!lit && !small);
      if (showLabel) {
        const fs = n.ring <= 1 ? (small ? 10 : 11.5) : small ? 9 : 10;
        ctx.font = `${n.ring <= 1 ? 500 : 400} ${fs}px ${getComputedStyle(document.body).getPropertyValue('--font-mono') || 'monospace'}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = isActive ? palette.accent : n.ring <= 1 ? palette.ink : palette.ink3;
        ctx.globalAlpha = on ? (isActive ? 1 : 0.9) : 0.18;
        // Keep the label inside the canvas instead of letting it clip at the edge
        const half = ctx.measureText(n.label).width / 2;
        const lx = Math.min(Math.max(p.x, half + 4), w - half - 4);
        ctx.fillText(n.label, lx, p.y + size + 6);
      }
      ctx.globalAlpha = 1;
    });
  }

  function frame(now) {
    t = now;
    if (visible) { draw(); }
    raf = requestAnimationFrame(frame);
  }

  /* ---- Wiring ---- */
  const stage = canvas.parentElement;

  stage.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = stage.getBoundingClientRect();
    pointer = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, inside: true };
    layoutButtons();
  }, { passive: true });

  stage.addEventListener('pointerleave', () => {
    pointer.inside = false;
    clear();
    layoutButtons();
  });

  // Keep hit areas glued to the painted nodes while they drift
  let btnFrame = 0;
  function layoutButtons() {
    cancelAnimationFrame(btnFrame);
    btnFrame = requestAnimationFrame(() => {
      NODES.forEach((n, i) => {
        const p = position(n);
        buttons[i].style.left = `${(p.x / w) * 100}%`;
        buttons[i].style.top = `${(p.y / h) * 100}%`;
      });
    });
  }

  const ro = new ResizeObserver(() => { layout(); draw(); });
  ro.observe(stage);

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !raf) raf = requestAnimationFrame(frame);
    if (!visible && raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { threshold: 0.01 }).observe(figure);

  // Repaint on theme change: the canvas does not inherit CSS transitions
  const mo = new MutationObserver(() => { refreshPalette(); draw(); });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-accent'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    setTimeout(() => { refreshPalette(); draw(); }, 50);
  });

  layout();
  draw();
  if (!raf) raf = requestAnimationFrame(frame);

  // Arrow keys walk the map
  host.addEventListener('keydown', (e) => {
    const idx = buttons.indexOf(document.activeElement);
    if (idx === -1) return;
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = (idx + keys[e.key] + buttons.length) % buttons.length;
    buttons[next].focus();
  });
}

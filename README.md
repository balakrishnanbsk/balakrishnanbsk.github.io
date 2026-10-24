# Balasudharsanakrishnan B — portfolio

A hand-built personal site. No framework, no build step, no template: plain
semantic HTML, modern CSS and ES modules, served as static files.

```
index.html              All content, authored as semantic HTML so it is
                        crawlable and readable without JavaScript.
assets/                 Résumé PDF.
styles/
  tokens.css            Design tokens: colour, type scale, space, motion.
                        Both themes and every user preference live here.
  base.css              Reset, document defaults, layout primitives, reveals.
  components.css        Buttons, chips, cards, dialog, cursor, toast, progress.
  nav.css               Sticky header, active-section indicator, mobile sheet.
  sections.css          The eight sections.
scripts/
  main.js               Composition root — each module fails on its own.
  modules/
    prefs.js            Theme / accent / density / motion, persisted locally.
    reveal.js           One IntersectionObserver for the whole page.
    nav.js              Scroll progress, active section, mobile sheet.
    cursor.js           Custom cursor + magnetic buttons (fine pointers only).
    career-map.js       Canvas constellation with a real button per node.
    tabs.js             One accessible tablist, used twice.
    experience.js       Timeline rail, active role, expanding entries.
    projects.js         Filtering, touch peek, case-study dialog.
    skills.js           Skill explorer and its cross-links.
    playground.js       The live token controls.
    clipboard.js        Copy email, with a fallback.
    toast.js            One toast element, reused.
```

## Running it

Any static server will do:

```bash
npx serve .
```

## Principles the code follows

- **Tokens are the single source of truth.** Theme, accent, density and motion
  all resolve to custom properties; nothing is hard-coded twice.
- **Motion is a variable, not a hard-coded duration.** `--motion` scales every
  transition, so `prefers-reduced-motion` and the playground's "Still" setting
  share one code path.
- **No hover-only affordances.** Everything reachable by mouse is reachable by
  keyboard and by touch; the career map is drawn on canvas but operated through
  real buttons.
- **Content lives in HTML.** JavaScript enhances; it never renders the content.

## Content

Every claim on the site comes from my résumé. Nothing is invented — where a
detail does not exist, the section simply omits it.

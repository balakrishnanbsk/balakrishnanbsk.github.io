/**
 * Tablist — one implementation, used by the About facets and the
 * Process stages. Full arrow-key / Home / End support.
 */

export function initTabs(listSelector, { onSelect } = {}) {
  const list = document.querySelector(listSelector);
  if (!list) return;

  const tabs = [...list.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return;

  const panelFor = (tab) => document.getElementById(tab.getAttribute('aria-controls'));

  function select(tab, { focus = false } = {}) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      if (t.hasAttribute('aria-expanded')) t.setAttribute('aria-expanded', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = panelFor(t);
      if (!panel) return;
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    if (focus) tab.focus();
    onSelect?.(tab);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(tab);
      let next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      select(next, { focus: true });
    });
  });

  // Normalise the initial state from the markup
  const initial = tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0];
  select(initial);
}

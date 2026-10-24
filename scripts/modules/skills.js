/**
 * Skill explorer — selecting a technology shows the products and roles
 * it actually appears in. No ratings, no percentages.
 */

export function initSkills() {
  const cloud = document.getElementById('skillCloud');
  if (!cloud) return;

  const techs = [...cloud.querySelectorAll('.tech')];
  const cats = document.getElementById('skillCats');
  const layers = [...document.querySelectorAll('.stack__layer')];

  const panel = document.getElementById('skillDetail');
  const elCat = document.getElementById('skillDetailCat');
  const elName = document.getElementById('skillDetailName');
  const elIntro = document.getElementById('skillDetailIntro');
  const groupProjects = document.getElementById('skillDetailProjects');
  const groupRoles = document.getElementById('skillDetailRoles');
  const groupRelated = document.getElementById('skillDetailRelated');

  const CAT_LABELS = {
    frontend: 'Frontend', frameworks: 'Frameworks', styling: 'Styling',
    tools: 'Tools', backend: 'Backend', other: 'Also worked with'
  };

  // Project display names come straight from the case studies — one source of truth
  const projectName = (id) =>
    document.querySelector(`#${CSS.escape(id)} .case__title`)?.textContent?.trim() || id;

  const techName = (el) => el.childNodes[1]?.textContent?.trim() || el.textContent.trim();

  let selected = null;

  function clearSelection() {
    selected = null;
    techs.forEach((t) => { t.setAttribute('aria-pressed', 'false'); t.classList.remove('is-dim'); });
    layers.forEach((l) => l.classList.remove('is-dim', 'is-lit'));
    elCat.textContent = 'Toolbox';
    elName.textContent = 'Pick a technology';
    elIntro.hidden = false;
    groupProjects.hidden = groupRoles.hidden = groupRelated.hidden = true;
  }

  function select(tech) {
    if (selected === tech) { clearSelection(); return; }
    selected = tech;

    const name = techName(tech);
    const related = (tech.dataset.related || '').split('|').filter(Boolean);
    const relatedSet = new Set(related);

    techs.forEach((t) => {
      const on = t === tech;
      t.setAttribute('aria-pressed', String(on));
      t.classList.toggle('is-dim', !on && !relatedSet.has(techName(t)));
    });

    layers.forEach((l) => {
      const lit = l.dataset.layer === tech.dataset.layer;
      l.classList.toggle('is-lit', lit);
      l.classList.toggle('is-dim', !lit);
    });

    panel.classList.remove('is-in');
    void panel.offsetWidth;

    elCat.textContent = CAT_LABELS[tech.dataset.cat] || 'Toolbox';
    elName.textContent = name;
    elIntro.hidden = true;

    const projects = (tech.dataset.projects || '').split('|').filter(Boolean);
    fillList(groupProjects, projects, (id) => ({
      text: projectName(id),
      onClick: () => document.querySelector(`[data-case="${id}"]`)?.click()
    }));

    const roles = (tech.dataset.roles || '').split('|').filter(Boolean);
    fillList(groupRoles, roles, (role) => ({
      text: role,
      onClick: () => {
        document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }));

    if (related.length) {
      groupRelated.hidden = false;
      const row = groupRelated.querySelector('.chip-row');
      row.replaceChildren(...related.map((r) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.textContent = r;
        chip.addEventListener('click', () => {
          const target = techs.find((t) => techName(t) === r);
          if (target) { select(target); target.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
        });
        return chip;
      }));
    } else {
      groupRelated.hidden = true;
    }

    panel.classList.add('is-in');
  }

  function fillList(group, items, map) {
    if (!items.length) { group.hidden = true; return; }
    group.hidden = false;
    const ul = group.querySelector('ul');
    ul.replaceChildren(...items.map((item) => {
      const { text, onClick } = map(item);
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'skill-detail__link';
      btn.innerHTML = `<span></span><svg aria-hidden="true"><use href="#i-arrow"/></svg>`;
      btn.firstElementChild.textContent = text;
      btn.addEventListener('click', onClick);
      li.appendChild(btn);
      return li;
    }));
  }

  techs.forEach((t) => t.addEventListener('click', () => select(t)));

  cats?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    cats.querySelectorAll('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const cat = btn.dataset.cat;
    clearSelection();
    techs.forEach((t) => { t.hidden = !(cat === 'all' || t.dataset.cat === cat); });
  });

  clearSelection();
}

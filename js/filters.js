// PUSH Closer Map — Filters

import { NICHES, NICHE_ORDER } from './niches.js';
import { ZONE_NAMES } from './zones.js';

let currentNiche = 'all';
let currentZone = 'all';
let currentStatus = 'all';

const listeners = [];

export function onFilterChange(fn) { listeners.push(fn); }

function emit() {
  const filter = { niche: currentNiche, zone: currentZone, status: currentStatus };
  listeners.forEach(fn => fn(filter));
}

export function getFilter() {
  return { niche: currentNiche, zone: currentZone, status: currentStatus };
}

export function initFilters() {
  // Inject niche pills
  const container = document.getElementById('nichePills');
  NICHE_ORDER.forEach(key => {
    const niche = NICHES[key];
    if (!niche) return;
    const btn = document.createElement('button');
    btn.className = 'filter-pill';
    btn.dataset.filter = key;
    btn.innerHTML = `<span class="pill-dot" style="background:${niche.color}"></span>${niche.icon} ${key}`;
    container.appendChild(btn);
  });

  // Niche pill clicks
  const allPills = document.querySelectorAll('.filter-pill');
  allPills.forEach(pill => {
    pill.addEventListener('click', () => {
      allPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentNiche = pill.dataset.filter;
      emit();
    });
  });

  // Zone select
  const zoneSelect = document.getElementById('zoneFilter');
  ZONE_NAMES.forEach(z => {
    const opt = document.createElement('option');
    opt.value = z;
    opt.textContent = z;
    zoneSelect.appendChild(opt);
  });
  zoneSelect.addEventListener('change', () => {
    currentZone = zoneSelect.value;
    emit();
  });

  // Status select
  const statusSelect = document.getElementById('statusFilter');
  statusSelect.addEventListener('change', () => {
    currentStatus = statusSelect.value;
    emit();
  });
}

export function matchesFilter(lead, statusData) {
  const f = getFilter();
  if (f.niche !== 'all' && lead.niche !== f.niche) return false;
  if (f.zone !== 'all' && lead.quartier !== f.zone) return false;
  if (f.status !== 'all') {
    const s = statusData?.status || 'not_visited';
    if (s !== f.status) return false;
  }
  return true;
}

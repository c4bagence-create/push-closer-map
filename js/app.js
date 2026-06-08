// PUSH Closer Map — Main app

import { LEADS } from './data.js';
import { NICHES } from './niches.js';

// Expose for search (module scope not accessible from inline handlers)
window.__LEADS = LEADS;
window.__NICHES = NICHES;
import { CASA_CENTER, CASA_ZOOM } from './zones.js';
import { initFilters, onFilterChange, matchesFilter } from './filters.js';
import { openSheet, closeSheet } from './sidebar.js';
import { initStore, getStatus, getAllStatuses, getStats, STATUSES } from './store.js';

// ===== INIT STORE (Supabase + localStorage) =====
await initStore();

// ===== MAP INIT =====
const map = L.map('map', {
  center: [CASA_CENTER.lat, CASA_CENTER.lng],
  zoom: CASA_ZOOM,
  zoomControl: false,
  attributionControl: false
});

L.control.zoom({ position: 'topright' }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19,
  subdomains: 'abcd'
}).addTo(map);

// ===== MARKERS =====
const markers = new L.MarkerClusterGroup({
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  iconCreateFunction: cluster => {
    const count = cluster.getChildCount();
    let size = 'small';
    if (count > 20) size = 'large';
    else if (count > 10) size = 'medium';
    return L.divIcon({
      html: `<div><span>${count}</span></div>`,
      className: `marker-cluster marker-cluster-${size}`,
      iconSize: L.point(40, 40)
    });
  }
});

const markerMap = {}; // leadId -> marker

function createMarkerIcon(lead) {
  const niche = NICHES[lead.niche];
  const status = getStatus(lead.id);
  const color = getMarkerColor(lead, status);
  const size = 28;

  return L.divIcon({
    className: `custom-marker status-${status.status}`,
    html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;">${niche?.icon || '📍'}</div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
}

function getMarkerColor(lead, status) {
  const niche = NICHES[lead.niche];
  switch (status.status) {
    case 'closed':
    case 'not_interested': return '#95a5a6';
    case 'rdv_planned': return '#FFD700';
    case 'contacted':
    case 'demo_done': return '#FFFFFF';
    default: return niche?.color || '#FF3B7F';
  }
}

function buildMarkers() {
  markers.clearLayers();
  const statuses = getAllStatuses();

  let visibleCount = 0;
  LEADS.forEach(lead => {
    const statusData = statuses[lead.id];
    if (!matchesFilter(lead, statusData)) return;

    visibleCount++;
    const marker = L.marker([lead.lat, lead.lng], {
      icon: createMarkerIcon(lead)
    });

    marker.on('click', () => openSheet(lead));
    markers.addLayer(marker);
    markerMap[lead.id] = marker;
  });

  map.addLayer(markers);
  document.getElementById('leadCount').textContent = visibleCount;
}

// ===== FILTERS =====
initFilters();
onFilterChange(() => buildMarkers());

// ===== STATUS CHANGES =====
window.addEventListener('lead-status-change', e => {
  const { leadId } = e.detail;
  const lead = LEADS.find(l => l.id === leadId);
  if (lead && markerMap[leadId]) {
    markerMap[leadId].setIcon(createMarkerIcon(lead));
  }
});

// ===== STATS =====
document.getElementById('btnStats').addEventListener('click', openStats);
document.getElementById('closeStats').addEventListener('click', () => {
  document.getElementById('statsOverlay').classList.remove('active');
});
document.getElementById('statsOverlay').addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
});

function openStats() {
  const counts = getStats(LEADS);
  const total = LEADS.length;
  const visited = total - counts.not_visited;
  const pct = Math.round((visited / total) * 100);

  const nicheStats = {};
  LEADS.forEach(l => {
    if (!nicheStats[l.niche]) nicheStats[l.niche] = { total: 0, visited: 0 };
    nicheStats[l.niche].total++;
    const s = getAllStatuses()[l.id]?.status || 'not_visited';
    if (s !== 'not_visited') nicheStats[l.niche].visited++;
  });

  document.getElementById('statsBody').innerHTML = `
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Total leads</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${pct}%</div>
        <div class="stat-label">Couverture</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${counts.closed}</div>
        <div class="stat-label">Closes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${counts.rdv_planned}</div>
        <div class="stat-label">RDV planifies</div>
      </div>
    </div>

    <h3 style="font-size:14px;margin-bottom:12px;">Par statut</h3>
    ${Object.entries(STATUSES).map(([key, s]) => `
      <div class="stat-bar">
        <div class="stat-bar-label">
          <span><span class="status-dot status-${key}"></span>${s.label}</span>
          <span>${counts[key]}</span>
        </div>
        <div class="stat-bar-track">
          <div class="stat-bar-fill" style="width:${(counts[key]/total*100)}%;background:${s.color}"></div>
        </div>
      </div>
    `).join('')}

    <h3 style="font-size:14px;margin:16px 0 12px;">Par niche</h3>
    ${Object.entries(nicheStats).sort((a,b) => b[1].total - a[1].total).map(([niche, s]) => {
      const n = NICHES[niche];
      return `
        <div class="stat-bar">
          <div class="stat-bar-label">
            <span>${n?.icon || ''} ${niche}</span>
            <span>${s.visited}/${s.total}</span>
          </div>
          <div class="stat-bar-track">
            <div class="stat-bar-fill" style="width:${(s.visited/s.total*100)}%;background:${n?.color || '#FF3B7F'}"></div>
          </div>
        </div>
      `;
    }).join('')}
  `;

  document.getElementById('statsOverlay').classList.add('active');
}

// ===== SEARCH =====
function initSearch() {
  const si = document.getElementById('searchInput');
  const sr = document.getElementById('searchResults');
  const sc = document.getElementById('searchClear');
  if (!si) return;

  function doSearch() {
    const q = si.value.trim().toLowerCase();
    sc.classList.toggle('visible', q.length > 0);
    if (q.length < 2) { sr.classList.remove('visible'); return; }

    const matches = LEADS.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.niche.toLowerCase().includes(q) ||
      (l.quartier && l.quartier.toLowerCase().includes(q))
    ).slice(0, 8);

    if (!matches.length) { sr.classList.remove('visible'); return; }

    sr.innerHTML = matches.map(l => {
      const n = NICHES[l.niche] || {};
      return `<div class="search-result-item" data-id="${l.id}">
        <span class="search-result-icon">${n.icon || '📍'}</span>
        <div><div class="search-result-name">${l.name}</div>
        <div class="search-result-sub">${l.niche} · ${l.quartier}</div></div>
      </div>`;
    }).join('');
    sr.classList.add('visible');

    sr.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const lead = LEADS.find(l => l.id === parseInt(item.dataset.id));
        if (lead) {
          map.setView([lead.lat, lead.lng], 17);
          openSheet(lead);
          sr.classList.remove('visible');
          si.value = '';
          sc.classList.remove('visible');
        }
      });
    });
  }

  si.addEventListener('input', doSearch);
  si.addEventListener('keyup', doSearch);
  sc.addEventListener('click', () => { si.value = ''; sr.classList.remove('visible'); sc.classList.remove('visible'); });
  document.addEventListener('click', e => { if (!e.target.closest('.header-center')) sr.classList.remove('visible'); });
}
initSearch();

// ===== INIT =====
buildMarkers();

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

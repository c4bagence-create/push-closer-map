// PUSH Closer Map — Main app (v2: closer system + geoloc)

import { LEADS } from './data.js';
import { NICHES } from './niches.js';
import { CASA_CENTER, CASA_ZOOM } from './zones.js';
import { initFilters, onFilterChange, matchesFilter } from './filters.js';
import { openSheet, closeSheet } from './sidebar.js';
import { initStore, getStatus, getAllStatuses, getStats, STATUSES } from './store.js';
import { CLOSERS, login, getSession, logout, isAdmin, leadInMyZone } from './closers.js';

window.__LEADS = LEADS;
window.__NICHES = NICHES;

// ===== LOGIN FLOW =====
const loginOverlay = document.getElementById('loginOverlay');
const loginClosers = document.getElementById('loginClosers');
const loginForm = document.getElementById('loginForm');
const loginName = document.getElementById('loginName');
const loginPassword = document.getElementById('loginPassword');
const loginSubmit = document.getElementById('loginSubmit');
const loginBack = document.getElementById('loginBack');
const loginError = document.getElementById('loginError');

let selectedCloserId = null;

function checkAuth() {
  const session = getSession();
  if (session) {
    loginOverlay.classList.add('hidden');
    setTimeout(() => loginOverlay.style.display = 'none', 400);
    initApp(session);
    return true;
  }
  return false;
}

if (!checkAuth()) {
  // Show login
  loginClosers.querySelectorAll('.closer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCloserId = btn.dataset.id;
      const closer = CLOSERS[selectedCloserId];
      loginName.textContent = `${closer.avatar} ${closer.name}`;
      loginClosers.style.display = 'none';
      loginForm.style.display = 'block';
      loginPassword.focus();
      loginError.style.display = 'none';
    });
  });

  loginBack.addEventListener('click', () => {
    loginClosers.style.display = 'flex';
    loginForm.style.display = 'none';
    loginPassword.value = '';
  });

  loginSubmit.addEventListener('click', tryLogin);
  loginPassword.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });
}

function tryLogin() {
  const session = login(selectedCloserId, loginPassword.value);
  if (session) {
    loginOverlay.classList.add('hidden');
    setTimeout(() => loginOverlay.style.display = 'none', 400);
    initApp(session);
  } else {
    loginError.style.display = 'block';
    loginPassword.value = '';
    loginPassword.focus();
  }
}

// ===== MAIN APP INIT =====
async function initApp(session) {
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
    maxZoom: 19, subdomains: 'abcd'
  }).addTo(map);

  // ===== CLOSER HEADER INDICATOR =====
  const headerRight = document.querySelector('.header-right');
  const indicator = document.createElement('div');
  indicator.className = 'closer-indicator';
  indicator.style.background = session.color + '20';
  indicator.style.color = session.color;
  indicator.innerHTML = `<span class="closer-dot" style="background:${session.color}"></span>${session.avatar} ${session.name}`;
  indicator.addEventListener('click', () => {
    if (confirm('Se deconnecter ?')) logout();
  });
  headerRight.prepend(indicator);

  // ===== ZONE BANNER =====
  if (!session.isAdmin && session.zones?.length) {
    const banner = document.createElement('div');
    banner.className = 'zone-banner';
    banner.textContent = `📍 ${session.zones.slice(0, 3).join(', ')}${session.zones.length > 3 ? '...' : ''}`;
    document.body.appendChild(banner);
    setTimeout(() => banner.style.opacity = '0', 5000);
    setTimeout(() => banner.remove(), 6000);
  }

  // ===== FILTER LEADS BY ZONE =====
  const myLeads = session.isAdmin ? LEADS : LEADS.filter(l => leadInMyZone(l));

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

  const markerMap = {};

  function createMarkerIcon(lead) {
    const niche = NICHES[lead.niche];
    const status = getStatus(lead.id);
    const color = getMarkerColor(lead, status);
    const size = 28;
    const opacity = (status.status === 'closed' || status.status === 'not_interested') ? 0.4 : 1;

    return L.divIcon({
      className: `custom-marker status-${status.status}`,
      html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;opacity:${opacity};${status.status !== 'not_visited' ? 'border:2px solid #fff;box-shadow:0 0 4px rgba(0,0,0,0.2);' : ''}">${niche?.icon || '📍'}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  function getMarkerColor(lead, status) {
    const niche = NICHES[lead.niche];
    switch (status.status) {
      case 'closed': return '#95a5a6';
      case 'not_interested': return '#bdc3c7';
      case 'rdv_planned': return '#FFD700';
      case 'demo_done': return '#E67E22';
      case 'contacted': return '#F1C40F';
      default: return niche?.color || '#FF3B7F';
    }
  }

  function buildMarkers() {
    markers.clearLayers();
    const statuses = getAllStatuses();

    let visibleCount = 0;
    myLeads.forEach(lead => {
      const statusData = statuses[lead.id];
      if (!matchesFilter(lead, statusData)) return;

      visibleCount++;
      const marker = L.marker([lead.lat, lead.lng], { icon: createMarkerIcon(lead) });
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

  // ===== STATUS CHANGES (grey out completed) =====
  window.addEventListener('lead-status-change', e => {
    const { leadId } = e.detail;
    const lead = myLeads.find(l => l.id === leadId);
    if (lead && markerMap[leadId]) {
      markerMap[leadId].setIcon(createMarkerIcon(lead));
    }
  });

  // ===== GEOLOCATION — Snap Map style =====
  const carMarkers = {}; // closerId -> L.marker
  const CAR_EMOJI = '🏎️';

  // Broadcast my location
  let lastBroadcast = 0;
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      pos => {
        const now = Date.now();
        if (now - lastBroadcast < 5000) return; // Max 1 update per 5s
        lastBroadcast = now;

        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, heading: pos.coords.heading || 0 };

        // Update my car on map
        updateCarMarker(session.id, session, loc);

        // Broadcast via Supabase realtime channel
        broadcastLocation(session.id, session.name, session.color, loc);
      },
      err => console.warn('Geoloc error:', err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }

  function updateCarMarker(closerId, closer, loc) {
    const rotation = loc.heading || 0;
    const icon = L.divIcon({
      className: 'car-marker',
      html: `<div class="car-label" style="border-left:3px solid ${closer.color}">${closer.avatar} ${closer.name}</div>
             <div class="car-icon" style="transform:rotate(${rotation}deg)">${CAR_EMOJI}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    if (carMarkers[closerId]) {
      carMarkers[closerId].setLatLng([loc.lat, loc.lng]);
      carMarkers[closerId].setIcon(icon);
    } else {
      carMarkers[closerId] = L.marker([loc.lat, loc.lng], { icon, zIndexOffset: 1000 }).addTo(map);
    }
  }

  // ===== BROADCAST / RECEIVE LOCATIONS via Supabase Realtime =====
  function broadcastLocation(closerId, name, color, loc) {
    // Use localStorage as fallback broadcast (same device)
    const locs = JSON.parse(localStorage.getItem('push_closer_locations') || '{}');
    locs[closerId] = { name, color, ...loc, ts: Date.now() };
    localStorage.setItem('push_closer_locations', JSON.stringify(locs));

    // Try Supabase broadcast via existing WebSocket
    try {
      const wsUrl = 'https://jdlyfilsgbtxfrdxccli.supabase.co'.replace('https://', 'wss://') +
        '/realtime/v1/websocket?apikey=sb_publishable_nZdKSA2zRIGb2lB_k5JGNQ_5PORgiwJ&vsn=1.0.0';

      if (!window.__pushLocWs || window.__pushLocWs.readyState !== WebSocket.OPEN) {
        window.__pushLocWs = new WebSocket(wsUrl);
        window.__pushLocWs.onopen = () => {
          // Join presence channel
          window.__pushLocWs.send(JSON.stringify({
            topic: 'realtime:push_locations',
            event: 'phx_join',
            payload: { config: { broadcast: { self: false } } },
            ref: 'loc1'
          }));
          // Heartbeat
          setInterval(() => {
            if (window.__pushLocWs?.readyState === WebSocket.OPEN) {
              window.__pushLocWs.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: 'hb' }));
            }
          }, 30000);
        };

        window.__pushLocWs.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.event === 'broadcast' && msg.payload?.type === 'location') {
              const d = msg.payload;
              if (d.closerId !== session.id) {
                updateCarMarker(d.closerId, { name: d.name, color: d.color, avatar: d.avatar || '🏎️' }, d);
              }
            }
          } catch {}
        };
      }

      // Send broadcast
      if (window.__pushLocWs?.readyState === WebSocket.OPEN) {
        window.__pushLocWs.send(JSON.stringify({
          topic: 'realtime:push_locations',
          event: 'broadcast',
          payload: { type: 'location', closerId, name, color, avatar: session.avatar, ...loc },
          ref: 'bc' + Date.now()
        }));
      }
    } catch {}
  }

  // Admin: poll localStorage for other closers (fallback if same network)
  if (session.isAdmin) {
    setInterval(() => {
      const locs = JSON.parse(localStorage.getItem('push_closer_locations') || '{}');
      Object.entries(locs).forEach(([id, data]) => {
        if (id !== session.id && Date.now() - data.ts < 60000) {
          const closer = CLOSERS[id] || { name: data.name, color: data.color, avatar: '🏎️' };
          updateCarMarker(id, closer, data);
        }
      });
    }, 3000);
  }

  // ===== STATS =====
  document.getElementById('btnStats').addEventListener('click', () => openStatsModal(myLeads, session));
  document.getElementById('closeStats').addEventListener('click', () => {
    document.getElementById('statsOverlay').classList.remove('active');
  });
  document.getElementById('statsOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });

  function openStatsModal(leads, session) {
    const counts = getStats(leads);
    const total = leads.length;
    const visited = total - counts.not_visited;
    const pct = Math.round((visited / total) * 100);

    const nicheStats = {};
    leads.forEach(l => {
      if (!nicheStats[l.niche]) nicheStats[l.niche] = { total: 0, visited: 0 };
      nicheStats[l.niche].total++;
      const s = getAllStatuses()[l.id]?.status || 'not_visited';
      if (s !== 'not_visited') nicheStats[l.niche].visited++;
    });

    // Admin stats: show closer progress
    const closerStatsHtml = session.isAdmin ? `
      <h3 style="font-size:14px;margin:16px 0 12px;">Par closer</h3>
      ${Object.entries(CLOSERS).filter(([k]) => k !== 'admin').map(([id, c]) => {
        const closerLeads = LEADS.filter(l => {
          const q = (l.quartier || '').toLowerCase();
          return c.zones.some(z => q.includes(z.toLowerCase()));
        });
        const closerVisited = closerLeads.filter(l => {
          const s = getAllStatuses()[l.id]?.status || 'not_visited';
          return s !== 'not_visited';
        }).length;
        return `
          <div class="stat-bar">
            <div class="stat-bar-label">
              <span>${c.avatar} ${c.name}</span>
              <span>${closerVisited}/${closerLeads.length}</span>
            </div>
            <div class="stat-bar-track">
              <div class="stat-bar-fill" style="width:${closerLeads.length ? (closerVisited/closerLeads.length*100) : 0}%;background:${c.color}"></div>
            </div>
          </div>`;
      }).join('')}
    ` : '';

    document.getElementById('statsBody').innerHTML = `
      <div class="stat-grid">
        <div class="stat-card"><div class="stat-value">${total}</div><div class="stat-label">${session.isAdmin ? 'Total' : 'Mes'} leads</div></div>
        <div class="stat-card"><div class="stat-value">${pct}%</div><div class="stat-label">Couverture</div></div>
        <div class="stat-card"><div class="stat-value">${counts.closed}</div><div class="stat-label">Closes</div></div>
        <div class="stat-card"><div class="stat-value">${counts.rdv_planned}</div><div class="stat-label">RDV</div></div>
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

      ${closerStatsHtml}

      <h3 style="font-size:14px;margin:16px 0 12px;">Par niche</h3>
      ${Object.entries(nicheStats).sort((a, b) => b[1].total - a[1].total).map(([niche, s]) => {
        const n = NICHES[niche];
        return `
          <div class="stat-bar">
            <div class="stat-bar-label">
              <span>${n?.icon || ''} ${niche}</span>
              <span>${s.visited}/${s.total}</span>
            </div>
            <div class="stat-bar-track">
              <div class="stat-bar-fill" style="width:${(s.visited / s.total * 100)}%;background:${n?.color || '#FF3B7F'}"></div>
            </div>
          </div>`;
      }).join('')}
    `;

    document.getElementById('statsOverlay').classList.add('active');
  }

  // ===== SEARCH =====
  const si = document.getElementById('searchInput');
  const sr = document.getElementById('searchResults');
  const sc = document.getElementById('searchClear');

  function doSearch() {
    const q = si.value.trim().toLowerCase();
    sc.classList.toggle('visible', q.length > 0);
    if (q.length < 2) { sr.classList.remove('visible'); return; }

    const matches = myLeads.filter(l =>
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
        const lead = myLeads.find(l => l.id === parseInt(item.dataset.id));
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

  // ===== BUILD & GO =====
  buildMarkers();

  // Fit to zone for non-admin
  if (!session.isAdmin && myLeads.length) {
    const bounds = L.latLngBounds(myLeads.map(l => [l.lat, l.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

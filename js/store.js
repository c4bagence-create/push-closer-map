// PUSH Closer Map — Store (localStorage + Supabase sync)

import { fetchAllStatuses, upsertStatus as sbUpsert, subscribeStatuses, isConnected } from './supabase.js';

const STORE_KEY = 'push_lead_statuses';
const CLOSER_KEY = 'push_closer_info';

let supabaseOnline = false;
let statusCache = {}; // in-memory cache

// Status enum
export const STATUSES = {
  not_visited: { label: 'Pas visite', color: '#FF3B7F' },
  contacted: { label: 'Contacte', color: '#F1C40F' },
  demo_done: { label: 'Demo faite', color: '#E67E22' },
  rdv_planned: { label: 'RDV planifie', color: '#FFD700' },
  closed: { label: 'Close', color: '#2ecc71' },
  not_interested: { label: 'Pas interesse', color: '#95a5a6' }
};

// ===== LOCAL STORAGE =====
function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
  catch { return {}; }
}

function saveLocal(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
}

// ===== INIT (try Supabase, fallback localStorage) =====
export async function initStore() {
  statusCache = loadLocal();

  supabaseOnline = await isConnected();
  if (supabaseOnline) {
    console.log('Supabase connected — syncing statuses');
    const remote = await fetchAllStatuses();
    if (remote && Object.keys(remote).length > 0) {
      // Merge: remote wins for newer entries
      Object.entries(remote).forEach(([leadId, data]) => {
        const local = statusCache[leadId];
        if (!local || new Date(data.updated_at) > new Date(local.updated_at || 0)) {
          statusCache[leadId] = data;
        }
      });
      saveLocal(statusCache);
    }

    // Subscribe to real-time changes
    subscribeStatuses(record => {
      if (record.lead_id) {
        statusCache[record.lead_id] = record;
        saveLocal(statusCache);
        window.dispatchEvent(new CustomEvent('lead-status-change', {
          detail: { leadId: record.lead_id, ...record }
        }));
      }
    });
  } else {
    console.warn('Supabase offline — localStorage only');
  }
}

// ===== GETTERS =====
export function getStatus(leadId) {
  return statusCache[leadId] || { status: 'not_visited', notes: '', next_rdv: '', closer_name: '' };
}

export function getAllStatuses() {
  return statusCache;
}

// ===== SETTERS =====
export function setStatus(leadId, statusData) {
  statusCache[leadId] = { ...statusData, updated_at: new Date().toISOString() };
  saveLocal(statusCache);

  // Sync to Supabase in background
  if (supabaseOnline) {
    sbUpsert(leadId, statusData).catch(() => {
      console.warn('Supabase sync failed for lead', leadId);
    });
  }

  window.dispatchEvent(new CustomEvent('lead-status-change', {
    detail: { leadId, ...statusCache[leadId] }
  }));
}

// ===== CLOSER INFO =====
export function getCloserInfo() {
  try { return JSON.parse(localStorage.getItem(CLOSER_KEY) || '{}'); }
  catch { return {}; }
}

export function setCloserInfo(info) {
  localStorage.setItem(CLOSER_KEY, JSON.stringify(info));
}

// ===== STATS =====
export function getStats(leads) {
  const counts = { not_visited: 0, contacted: 0, demo_done: 0, rdv_planned: 0, closed: 0, not_interested: 0 };
  leads.forEach(l => {
    const s = statusCache[l.id]?.status || 'not_visited';
    counts[s] = (counts[s] || 0) + 1;
  });
  return counts;
}

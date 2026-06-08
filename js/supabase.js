// PUSH Closer Map — Supabase client

const SUPABASE_URL = 'https://jdlyfilsgbtxfrdxccli.supabase.co';
const SUPABASE_KEY = 'sb_publishable_nZdKSA2zRIGb2lB_k5JGNQ_5PORgiwJ';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const rest = (table) => `${SUPABASE_URL}/rest/v1/${table}`;

// ===== LEADS =====
export async function fetchLeads() {
  const res = await fetch(`${rest('leads')}?select=*&order=id`, { headers });
  if (!res.ok) return null;
  return res.json();
}

// ===== LEAD STATUS =====
export async function fetchAllStatuses() {
  const res = await fetch(`${rest('lead_status')}?select=*`, { headers });
  if (!res.ok) return {};
  const rows = await res.json();
  const map = {};
  rows.forEach(r => { map[r.lead_id] = r; });
  return map;
}

export async function upsertStatus(leadId, data) {
  const body = {
    lead_id: leadId,
    closer_name: data.closer_name || '',
    status: data.status || 'not_visited',
    next_rdv: data.next_rdv || null,
    notes: data.notes || '',
    updated_at: new Date().toISOString()
  };

  const res = await fetch(`${rest('lead_status')}?on_conflict=lead_id`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation,resolution=merge-duplicates' },
    body: JSON.stringify(body)
  });
  return res.ok;
}

// ===== REALTIME (SSE via Supabase Realtime) =====
let realtimeWs = null;

export function subscribeStatuses(callback) {
  // Use Supabase Realtime WebSocket
  const wsUrl = SUPABASE_URL.replace('https://', 'wss://') + '/realtime/v1/websocket?apikey=' + SUPABASE_KEY + '&vsn=1.0.0';

  try {
    realtimeWs = new WebSocket(wsUrl);

    realtimeWs.onopen = () => {
      // Join channel for lead_status changes
      const joinMsg = JSON.stringify({
        topic: 'realtime:public:lead_status',
        event: 'phx_join',
        payload: { config: { broadcast: { self: false }, postgres_changes: [{ event: '*', schema: 'public', table: 'lead_status' }] } },
        ref: '1'
      });
      realtimeWs.send(joinMsg);

      // Heartbeat every 30s
      setInterval(() => {
        if (realtimeWs.readyState === WebSocket.OPEN) {
          realtimeWs.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: 'hb' }));
        }
      }, 30000);
    };

    realtimeWs.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === 'postgres_changes' || msg.event === 'INSERT' || msg.event === 'UPDATE') {
          const record = msg.payload?.record || msg.payload?.data?.record;
          if (record) callback(record);
        }
      } catch {}
    };

    realtimeWs.onerror = () => console.warn('Realtime connection failed — using local only');
  } catch {
    console.warn('WebSocket not available — using local only');
  }
}

// ===== HEALTH CHECK =====
export async function isConnected() {
  try {
    const res = await fetch(`${rest('leads')}?select=id&limit=1`, { headers });
    return res.ok;
  } catch {
    return false;
  }
}

// PUSH Closer Map — Closer profiles & zone assignments

export const CLOSERS = {
  anes: {
    name: 'Anes',
    password: 'anes2026',
    color: '#FF3B7F',
    zones: ['Maarif', 'Palmier', '2 Mars', 'Les Princesses', 'Maarif Extension', 'Normandie'],
    avatar: '🔴'
  },
  zack: {
    name: 'Zack',
    password: 'zack2026',
    color: '#7C5CFF',
    zones: ['Gauthier', 'Racine', 'Centre-ville', 'Bourgogne', 'Ancienne Medina', 'Habous', 'Hopitaux', 'Mers Sultan', 'Lafayette', 'Ziraoui'],
    avatar: '🟣'
  },
  hajj: {
    name: 'Hajj',
    password: 'hajj2026',
    color: '#FF6B2C',
    zones: ['Ain Diab', 'Corniche', 'Anfa', 'California', 'Riviera', 'Oasis', 'Marina', 'Dar Bouazza', 'Val Fleuri'],
    avatar: '🟠'
  },
  yacine: {
    name: 'Yacine',
    password: 'yacine2026',
    color: '#2ecc71',
    zones: ['Sidi Maarouf', 'Hay Hassani', 'Derb Sultan', 'Oulfa', 'CIL', 'Belvédère', 'Bournazel', 'Beausejour', 'Triangle d\'Or', 'Ain Sebaâ', 'Dar el Beida', 'Route des Oulad Ziane'],
    avatar: '🟢'
  },
  sonny: {
    name: 'Sonny',
    password: 'sonnyboss',
    color: '#FFD700',
    zones: [],
    avatar: '',
    isAdmin: true
  }
};

const AUTH_KEY = 'push_closer_auth';

export function login(username, password) {
  const closer = CLOSERS[username];
  if (!closer) return null;
  if (closer.password !== password) return null;
  const session = { id: username, ...closer };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch { return null; }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  location.reload();
}

export function isAdmin() {
  const s = getSession();
  return s?.isAdmin === true;
}

export function getCloserZones() {
  const s = getSession();
  if (!s) return [];
  if (s.isAdmin) return [];
  return s.zones || [];
}

export function leadInMyZone(lead) {
  const zones = getCloserZones();
  if (zones.length === 0) return true;
  const q = (lead.quartier || '').toLowerCase();
  return zones.some(z => q.includes(z.toLowerCase()) || z.toLowerCase().includes(q));
}

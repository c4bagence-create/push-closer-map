// PUSH Closer Map — Sidebar / Bottom sheet (v3 — arguments first, CRM behind button)

import { NICHES } from './niches.js';
import { getStatus, setStatus, getCloserInfo, setCloserInfo, STATUSES } from './store.js';

const sheet = document.getElementById('bottomSheet');
const overlay = document.getElementById('sheetOverlay');
const content = document.getElementById('sheetContent');
let currentLead = null;
let crmOpen = false;

export function openSheet(lead) {
  currentLead = lead;
  crmOpen = false;
  const niche = NICHES[lead.niche] || {};
  const status = getStatus(lead.id);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lead.lat},${lead.lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${lead.lat},${lead.lng}&navigate=yes`;

  content.innerHTML = `
    <!-- HEADER -->
    <div class="lead-header">
      <div class="lead-icon" style="background:${niche.color}20">${niche.icon || '📍'}</div>
      <div class="lead-header-text">
        <div class="lead-name">${lead.name}</div>
        <div class="lead-niche">${lead.niche} · ${lead.quartier} · Score ${lead.score}</div>
      </div>
    </div>

    <!-- INFO RAPIDES -->
    <div class="lead-meta">
      ${lead.rating > 0 ? `<span class="meta-badge meta-rating">⭐ ${lead.rating}${lead.reviews > 0 ? ` (${lead.reviews})` : ''}</span>` : ''}
      ${lead.address ? `<span class="meta-badge">📍 ${lead.address}</span>` : ''}
      <span class="meta-badge"><span class="status-dot status-${status.status}"></span>${STATUSES[status.status]?.label || 'Pas visite'}</span>
    </div>

    <!-- BOUTONS ACTIONS -->
    <div class="action-grid">
      ${lead.phone ? `
        <a href="tel:${lead.phone}" class="action-card action-call">
          <div class="action-icon">📞</div>
          <div class="action-label">Appeler</div>
          <div class="action-detail">${lead.phone}</div>
        </a>
      ` : ''}
      <a href="${mapsUrl}" target="_blank" class="action-card action-nav">
        <div class="action-icon">🗺️</div>
        <div class="action-label">Google Maps</div>
      </a>
      <a href="${wazeUrl}" target="_blank" class="action-card action-nav">
        <div class="action-icon">🚗</div>
        <div class="action-label">Waze</div>
      </a>
      ${lead.website ? `
        <a href="${lead.website}" target="_blank" class="action-card">
          <div class="action-icon">🌐</div>
          <div class="action-label">Site</div>
        </a>
      ` : ''}
    </div>

    <!-- ===== ARGUMENTS DE CLOSING (TOUJOURS VISIBLE) ===== -->
    ${niche.whyPush ? `
    <div class="args-section">
      <div class="args-title">🎯 Pourquoi PUSH pour ce ${lead.niche.toLowerCase()}</div>
      <ul class="guide-list">
        ${niche.whyPush.map(a => `<li>${a}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${niche.closingArgs ? `
    <div class="args-section">
      <div class="args-title">💬 Arguments de closing</div>
      <ul class="guide-list">
        ${niche.closingArgs.map(a => `<li>${a}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    ${niche.demoTips ? `
    <div class="args-section">
      <div class="args-title">📱 Tips demo tablette</div>
      <ul class="guide-list">
        ${niche.demoTips.map(t => `<li>${t}</li>`).join('')}
      </ul>
    </div>
    ` : ''}

    <!-- NOTIFICATIONS PRE-ECRITES -->
    ${niche.notifications ? `
    <div class="notif-section">
      <button class="section-toggle" id="notifToggle">
        📱 Notifications pre-ecrites (${niche.notifications.length})
        <span class="arrow">▼</span>
      </button>
      <div class="toggle-content" id="notifContent">
        ${niche.notifications.map(n => `<div class="notif-card" data-copy="${n.replace(/"/g, '&quot;')}">${n}<span class="copy-hint">copier</span></div>`).join('')}
      </div>
    </div>
    ` : ''}

    <!-- ===== BOUTON CLOSING → ouvre le CRM ===== -->
    <button class="btn-closing" id="btnClosing">
      🎯 Closing — Suivi de visite
    </button>

    <!-- CRM PANEL (cache par defaut) -->
    <div class="crm-panel" id="crmPanel">
      <div class="crm-panel-title">Suivi de visite</div>

      <div class="form-group">
        <label class="form-label">Closer</label>
        <input class="form-input" id="crmCloserName" value="${getCloserInfo().name || ''}" placeholder="Ton prenom">
      </div>

      <div class="form-group">
        <label class="form-label">Demo faite ?</label>
        <div class="radio-row">
          <label class="radio-pill"><input type="radio" name="demo" value="no" ${status.demo !== 'yes' ? 'checked' : ''}><span>Non</span></label>
          <label class="radio-pill"><input type="radio" name="demo" value="yes" ${status.demo === 'yes' ? 'checked' : ''}><span>Oui</span></label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Interesse ?</label>
        <div class="radio-row">
          <label class="radio-pill"><input type="radio" name="interested" value="no" ${status.interested === 'no' ? 'checked' : ''}><span>Non</span></label>
          <label class="radio-pill"><input type="radio" name="interested" value="maybe" ${status.interested !== 'yes' && status.interested !== 'no' ? 'checked' : ''}><span>A relancer</span></label>
          <label class="radio-pill"><input type="radio" name="interested" value="yes" ${status.interested === 'yes' ? 'checked' : ''}><span>Oui</span></label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Statut</label>
        <select class="form-select" id="crmStatus">
          ${Object.entries(STATUSES).map(([k, v]) =>
            `<option value="${k}" ${status.status === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
      </div>

      <div class="form-group" id="rdvGroup" style="display:${status.status === 'rdv_planned' ? 'block' : 'none'}">
        <label class="form-label">Date RDV</label>
        <input class="form-input" type="date" id="crmRdv" value="${status.next_rdv || ''}">
      </div>

      <div class="form-group">
        <label class="form-label">A paye ?</label>
        <div class="radio-row">
          <label class="radio-pill"><input type="radio" name="paid" value="no" ${status.paid !== 'yes' ? 'checked' : ''}><span>Non</span></label>
          <label class="radio-pill"><input type="radio" name="paid" value="yes" ${status.paid === 'yes' ? 'checked' : ''}><span>Oui</span></label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Frais d'installation payes ?</label>
        <div class="radio-row">
          <label class="radio-pill"><input type="radio" name="install" value="no" ${status.install_paid !== 'yes' ? 'checked' : ''}><span>Non</span></label>
          <label class="radio-pill"><input type="radio" name="install" value="yes" ${status.install_paid === 'yes' ? 'checked' : ''}><span>Oui</span></label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" id="crmNotes" placeholder="Notes terrain...">${status.notes || ''}</textarea>
      </div>

      <button class="btn-save" id="btnSave">Sauvegarder</button>
      <div class="save-feedback" id="saveFeedback">Sauvegarde !</div>
    </div>
  `;

  bindSheetEvents(lead);
  sheet.classList.add('open');
  overlay.classList.add('active');
}

export function closeSheet() {
  sheet.classList.remove('open');
  overlay.classList.remove('active');
  currentLead = null;
}

function bindSheetEvents(lead) {
  overlay.onclick = closeSheet;

  // Closing button → toggle CRM panel
  document.getElementById('btnClosing')?.addEventListener('click', () => {
    const panel = document.getElementById('crmPanel');
    const btn = document.getElementById('btnClosing');
    crmOpen = !crmOpen;
    panel.classList.toggle('open', crmOpen);
    btn.classList.toggle('active', crmOpen);
    if (crmOpen) panel.scrollIntoView({ behavior: 'smooth' });
  });

  // Status change → show/hide RDV
  document.getElementById('crmStatus')?.addEventListener('change', function() {
    document.getElementById('rdvGroup').style.display = this.value === 'rdv_planned' ? 'block' : 'none';
  });

  // Save
  document.getElementById('btnSave')?.addEventListener('click', () => {
    const closerName = document.getElementById('crmCloserName')?.value.trim() || '';
    if (closerName) setCloserInfo({ name: closerName });

    const getRadio = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '';

    setStatus(lead.id, {
      status: document.getElementById('crmStatus').value,
      demo: getRadio('demo'),
      interested: getRadio('interested'),
      paid: getRadio('paid'),
      install_paid: getRadio('install'),
      notes: document.getElementById('crmNotes')?.value || '',
      next_rdv: document.getElementById('crmRdv')?.value || '',
      closer_name: closerName
    });

    const fb = document.getElementById('saveFeedback');
    fb.classList.add('show');
    setTimeout(() => fb.classList.remove('show'), 2000);
  });

  // Toggle sections
  document.getElementById('notifToggle')?.addEventListener('click', function() {
    this.classList.toggle('open');
    document.getElementById('notifContent').classList.toggle('open');
  });

  // Copy notifications
  content.querySelectorAll('.notif-card[data-copy]').forEach(card => {
    card.addEventListener('click', () => {
      navigator.clipboard.writeText(card.dataset.copy).then(() => {
        card.classList.add('copied');
        showToast('Copie !');
        setTimeout(() => card.classList.remove('copied'), 1500);
      });
    });
  });
}

function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Swipe down to close (mobile)
let startY = 0;
sheet.addEventListener('touchstart', e => {
  if (content.scrollTop <= 0) startY = e.touches[0].clientY;
}, { passive: true });
sheet.addEventListener('touchmove', e => {
  if (content.scrollTop <= 0) {
    const dy = e.touches[0].clientY - startY;
    if (dy > 80) closeSheet();
  }
}, { passive: true });

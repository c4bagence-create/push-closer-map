// PUSH Closer Map — Sidebar / Bottom sheet

import { NICHES } from './niches.js';
import { getStatus, setStatus, getCloserInfo, setCloserInfo, STATUSES } from './store.js';

const sheet = document.getElementById('bottomSheet');
const overlay = document.getElementById('sheetOverlay');
const content = document.getElementById('sheetContent');
let currentLead = null;

export function openSheet(lead) {
  currentLead = lead;
  const niche = NICHES[lead.niche] || {};
  const status = getStatus(lead.id);
  const closer = getCloserInfo();

  content.innerHTML = `
    <div class="lead-header">
      <div class="lead-icon" style="background:${niche.color}20">${niche.icon || '📍'}</div>
      <div>
        <div class="lead-name">${lead.name}</div>
        <div class="lead-niche"><span class="status-dot status-${status.status}"></span>${lead.niche} · ${lead.quartier}</div>
      </div>
    </div>

    <div class="lead-meta">
      ${lead.rating > 0 ? `<span class="meta-badge">⭐ ${lead.rating}</span>` : ''}
      ${lead.reviews > 0 ? `<span class="meta-badge">💬 ${lead.reviews} avis</span>` : ''}
      ${lead.phone ? `<span class="meta-badge">📞 ${lead.phone}</span>` : ''}
      <span class="meta-badge">📊 Score ${lead.score}</span>
      <span class="meta-badge">🏷️ Tier ${lead.tier}</span>
    </div>

    <div class="lead-actions">
      ${lead.phone ? `<a href="tel:${lead.phone}" class="btn-action primary">📞 Appeler</a>` : ''}
      ${lead.website ? `<a href="${lead.website}" target="_blank" class="btn-action">🌐 Site</a>` : ''}
      <button class="btn-action" id="btnGuide">📋 Guide</button>
    </div>

    <!-- CRM -->
    <div class="crm-section">
      <div class="crm-title">🎯 Suivi CRM</div>
      <div class="form-group">
        <label class="form-label">Ton nom</label>
        <input class="form-input" id="crmCloserName" value="${closer.name || ''}" placeholder="Prenom">
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
        <label class="form-label">Notes</label>
        <textarea class="form-textarea" id="crmNotes" placeholder="Notes terrain...">${status.notes || ''}</textarea>
      </div>
      <button class="btn-save" id="btnSave">Sauvegarder</button>
      <div class="save-feedback" id="saveFeedback">Sauvegarde !</div>
    </div>

    <!-- Niche guide -->
    <div class="guide-section">
      <button class="guide-toggle" id="guideToggle">
        📖 Arguments ${lead.niche}
        <span class="arrow">▼</span>
      </button>
      <div class="guide-content" id="guideContent">
        ${niche.whyPush ? `
          <div class="guide-block">
            <div class="guide-block-title">Pourquoi PUSH</div>
            <ul class="guide-list">
              ${niche.whyPush.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${niche.closingArgs ? `
          <div class="guide-block">
            <div class="guide-block-title">Arguments de closing</div>
            <ul class="guide-list">
              ${niche.closingArgs.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        ${niche.notifications ? `
          <div class="guide-block">
            <div class="guide-block-title">Notifications pre-ecrites (tap = copier)</div>
            ${niche.notifications.map(n => `<div class="notif-card" data-copy="${n.replace(/"/g, '&quot;')}">${n}<span class="copy-hint">copier</span></div>`).join('')}
          </div>
        ` : ''}
        ${niche.demoTips ? `
          <div class="guide-block">
            <div class="guide-block-title">Tips demo</div>
            <ul class="guide-list">
              ${niche.demoTips.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Bind events
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
  // Close on overlay click
  overlay.onclick = closeSheet;

  // Status change → show/hide RDV
  const statusEl = document.getElementById('crmStatus');
  statusEl?.addEventListener('change', () => {
    const rdvGroup = document.getElementById('rdvGroup');
    rdvGroup.style.display = statusEl.value === 'rdv_planned' ? 'block' : 'none';
  });

  // Save
  document.getElementById('btnSave')?.addEventListener('click', () => {
    const closerName = document.getElementById('crmCloserName').value.trim();
    if (closerName) setCloserInfo({ name: closerName });

    setStatus(lead.id, {
      status: statusEl.value,
      notes: document.getElementById('crmNotes').value,
      next_rdv: document.getElementById('crmRdv')?.value || '',
      closer_name: closerName
    });

    const fb = document.getElementById('saveFeedback');
    fb.classList.add('show');
    setTimeout(() => fb.classList.remove('show'), 2000);
  });

  // Guide toggle
  document.getElementById('guideToggle')?.addEventListener('click', function() {
    this.classList.toggle('open');
    document.getElementById('guideContent').classList.toggle('open');
  });

  // Guide button
  document.getElementById('btnGuide')?.addEventListener('click', () => {
    const toggle = document.getElementById('guideToggle');
    const gc = document.getElementById('guideContent');
    if (!gc.classList.contains('open')) {
      toggle.classList.add('open');
      gc.classList.add('open');
      gc.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Copy notifications
  content.querySelectorAll('.notif-card[data-copy]').forEach(card => {
    card.addEventListener('click', () => {
      navigator.clipboard.writeText(card.dataset.copy).then(() => {
        card.classList.add('copied');
        showToast('Notification copiee !');
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

// PUSH Closer Map — Sidebar (v4 — rebrand glassmorphism + Material Symbols)

import { NICHES } from './niches.js';
import { getStatus, setStatus, getCloserInfo, setCloserInfo, STATUSES } from './store.js';

const sheet = document.getElementById('bottomSheet');
const overlay = document.getElementById('sheetOverlay');
const content = document.getElementById('sheetContent');
let currentLead = null;
let crmOpen = false;

function scoreLabel(score) {
  if (score >= 70) return { text: 'Chaud', icon: 'trending_up' };
  if (score >= 50) return { text: 'Bon potentiel', icon: 'trending_up' };
  return { text: 'A explorer', icon: 'explore' };
}

function statusLabel(s) {
  return STATUSES[s]?.label || 'Pas visite';
}

export function openSheet(lead) {
  currentLead = lead;
  crmOpen = false;
  const niche = NICHES[lead.niche] || {};
  const status = getStatus(lead.id);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lead.lat},${lead.lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${lead.lat},${lead.lng}&navigate=yes`;
  const sl = scoreLabel(lead.score);
  const domain = lead.website ? lead.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : '';

  content.innerHTML = `
    <!-- IDENTITY CARD -->
    <div class="lead-identity">
      <h2 class="lead-name">${lead.name}</h2>
      <div class="lead-niche-line">
        <span class="material-symbols-outlined">location_on</span>
        ${lead.niche} · ${lead.quartier}
      </div>

      <div class="lead-badges">
        ${lead.rating > 0
          ? `<span class="badge badge-rating"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">star</span>${lead.rating}</span>`
          : `<span class="badge badge-missing">Pas de note</span>`}
        ${lead.reviews > 0
          ? `<span class="badge badge-reviews">${lead.reviews} avis</span>`
          : `<span class="badge badge-missing">0 avis</span>`}
        ${lead.website
          ? `<a href="${lead.website}" target="_blank" class="badge badge-site"><span class="material-symbols-outlined">language</span>Site Web</a>`
          : `<span class="badge badge-missing">Pas de site</span>`}
        ${lead.score >= 70
          ? `<span class="badge badge-potential"><span class="material-symbols-outlined">bolt</span>HAUT POTENTIEL</span>`
          : ''}
      </div>

      <!-- Business info -->
      <div class="biz-info">
        <div class="biz-row">
          <span class="material-symbols-outlined">call</span>
          ${lead.phone
            ? `<a href="tel:${lead.phone}" class="phone-link">${lead.phone}</a>`
            : `<span class="biz-missing">Pas de telephone</span>`}
        </div>
        <div class="biz-row">
          <span class="material-symbols-outlined">location_on</span>
          ${lead.address || `<span class="biz-missing">Pas d'adresse</span>`}
        </div>
        ${lead.website ? `
        <div class="biz-row">
          <span class="material-symbols-outlined">language</span>
          <a href="${lead.website}" target="_blank">${domain}</a>
        </div>` : ''}
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="action-bar">
      ${lead.phone ? `
        <a href="tel:${lead.phone}" class="action-btn">
          <div class="action-circle action-circle-primary">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">call</span>
          </div>
          <span class="action-label">Appeler</span>
        </a>
      ` : ''}
      <a href="${mapsUrl}" target="_blank" class="action-btn">
        <div class="action-circle action-circle-outline">
          <span class="material-symbols-outlined">map</span>
        </div>
        <span class="action-label">Maps</span>
      </a>
      <a href="${wazeUrl}" target="_blank" class="action-btn">
        <div class="action-circle action-circle-outline">
          <span class="material-symbols-outlined">directions_car</span>
        </div>
        <span class="action-label">Waze</span>
      </a>
      ${lead.website ? `
        <a href="${lead.website}" target="_blank" class="action-btn">
          <div class="action-circle action-circle-outline">
            <span class="material-symbols-outlined">language</span>
          </div>
          <span class="action-label">Site</span>
        </a>
      ` : ''}
    </div>

    <!-- SCORE -->
    <div class="score-section">
      <div class="score-label">Potentiel de Closing</div>
      <div class="score-row">
        <span class="score-value">${lead.score}</span>
        <span class="score-badge">
          <span class="material-symbols-outlined">${sl.icon}</span>
          ${sl.text}
        </span>
      </div>
    </div>

    <!-- CLOSING GUIDE -->
    <div class="guide-section">
      <div class="guide-title">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">menu_book</span>
        Guide de Closing
      </div>

      ${niche.whyPush ? `
        <div class="guide-subtitle">Pourquoi PUSH pour ce commerce</div>
        ${niche.whyPush.map(a => `
          <div class="arg-card">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">check_circle</span>
            <div class="arg-desc">${a}</div>
          </div>
        `).join('')}
      ` : ''}

      ${niche.closingArgs ? `
        <div class="guide-subtitle" style="margin-top:16px">Arguments Frappes</div>
        ${niche.closingArgs.map(a => `
          <div class="arg-card">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">check_circle</span>
            <div class="arg-desc">${a}</div>
          </div>
        `).join('')}
      ` : ''}

      ${niche.demoTips ? `
        <div class="guide-subtitle" style="margin-top:16px">Tips Demo Tablette</div>
        ${niche.demoTips.map(t => `
          <div class="arg-card">
            <span class="material-symbols-outlined">lightbulb</span>
            <div class="arg-desc">${t}</div>
          </div>
        `).join('')}
      ` : ''}
    </div>

    <!-- NOTIFICATIONS -->
    ${niche.notifications ? `
    <div class="toggle-section">
      <button class="toggle-btn" id="notifToggle">
        <span>Templates Push (${niche.notifications.length})</span>
        <span class="material-symbols-outlined">expand_more</span>
      </button>
      <div class="toggle-content" id="notifContent">
        ${niche.notifications.map(n => `
          <div class="notif-template" data-copy="${n.replace(/"/g, '&quot;')}">
            ${n}
            <div class="notif-copy"><span class="material-symbols-outlined">content_copy</span></div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- CTA BUTTON -->
    <div class="cta-bottom">
      <button class="btn-cta" id="btnClosing">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">add_task</span>
        Demarrer le Closing
      </button>
    </div>

    <!-- CRM PANEL -->
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

  // Closing CTA
  document.getElementById('btnClosing')?.addEventListener('click', () => {
    const panel = document.getElementById('crmPanel');
    crmOpen = !crmOpen;
    panel.classList.toggle('open', crmOpen);
    if (crmOpen) panel.scrollIntoView({ behavior: 'smooth' });
  });

  // Status → RDV
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

  // Toggles
  document.getElementById('notifToggle')?.addEventListener('click', function() {
    this.classList.toggle('open');
    document.getElementById('notifContent').classList.toggle('open');
  });

  // Copy notifications
  content.querySelectorAll('.notif-template[data-copy]').forEach(card => {
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
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

let startY = 0;
sheet.addEventListener('touchstart', e => { if (content.scrollTop <= 0) startY = e.touches[0].clientY; }, { passive: true });
sheet.addEventListener('touchmove', e => { if (content.scrollTop <= 0 && e.touches[0].clientY - startY > 80) closeSheet(); }, { passive: true });

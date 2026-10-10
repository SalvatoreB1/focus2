// WIP Hard Limit Enforcement Modal
import { store } from '../store.js';
import { icons } from '../icons.js';
import { sounds } from '../audio.js';
import { showToast } from './Toast.js';

let pendingActionCallback = null;

export function openWipLimitModal(onResolved = null, projectToActivateId = null) {
  pendingActionCallback = onResolved;
  sounds.playWarning();

  const activeProjects = store.getActiveProjects();
  const targetProject = projectToActivateId ? store.getProjectById(projectToActivateId) : null;

  const backdrop = document.getElementById('wip-modal-backdrop');
  if (!backdrop) return;

  const content = document.getElementById('wip-modal-content');
  if (!content) return;

  let activeProjectsHtml = '';
  if (activeProjects.length > 0) {
    activeProjectsHtml = `
      <div class="wip-current-active-label">
        ${targetProject ? `Elige cuál pausar para activar "${targetProject.title}":` : 'Proyectos que ocupan tus 2 slots de foco:'}
      </div>
      <div class="wip-active-resolutions">
        ${activeProjects
          .map((p, idx) => {
            const goal = store.getGoalById(p.macroGoalId);
            return `
            <div class="wip-active-item">
              <div class="wip-item-info">
                <div style="font-size:0.7rem; color:${goal ? goal.color : 'var(--text-muted)'}; font-weight:700;">
                  #${idx + 1} ${goal ? goal.title : 'Sin Meta'}
                </div>
                <div class="wip-item-title">${p.title}</div>
              </div>
              <div style="display:flex; gap:6px;">
                <button class="btn-pause-wip" data-action="pause-wip" data-project-id="${p.id}" title="Pausar y enviar al Freezer">
                  ${icons.snowflake} ${targetProject ? 'Pausar e intercambiar' : 'Pausar'}
                </button>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;
  }

  content.innerHTML = `
    <div class="wip-alert-icon-container">
      <div class="wip-alert-icon-circle">
        ${icons.shieldAlert}
      </div>
    </div>
    
    <div class="wip-alert-header">
      <h2 class="wip-alert-title">Límite de WIP (Máximo 2 Focos)</h2>
      <div class="wip-alert-message">
        Para mantener tu concentración profunda, no puedes tener más de 2 proyectos activos a la vez.
      </div>
    </div>

    ${activeProjectsHtml}

    <div class="form-actions" style="justify-content:center; margin-top:8px;">
      <button class="btn-cancel" id="btn-close-wip-modal" style="width:100%; text-align:center;">
        Cancelar, mantener foco actual
      </button>
    </div>
  `;

  // Attach event listeners for inline resolution
  content.querySelectorAll('[data-action="pause-wip"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const pid = e.currentTarget.getAttribute('data-project-id');
      if (projectToActivateId) {
        store.swapProjects(pid, projectToActivateId);
        showToast('¡Intercambio realizado! Proyecto activado en Modo Foco 🎯', 'success');
      } else {
        store.freezeProject(pid);
        showToast('Proyecto enviado a The Freezer. Slot de foco liberado.', 'info');
      }
      closeWipLimitModal();
      if (pendingActionCallback) {
        pendingActionCallback();
        pendingActionCallback = null;
      }
    });
  });

  const closeBtn = document.getElementById('btn-close-wip-modal');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeWipLimitModal();
    });
  }

  backdrop.classList.add('open');
}

export function closeWipLimitModal() {
  const backdrop = document.getElementById('wip-modal-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
  }
}

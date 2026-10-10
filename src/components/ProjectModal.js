// Create & Edit Project Modal
import { store } from '../store.js';
import { icons } from '../icons.js';
import { sounds } from '../audio.js';
import { showToast } from './Toast.js';
import { openWipLimitModal } from './WipModal.js';

let currentProject = null;

export function openProjectModal(projectData = null) {
  currentProject = projectData && projectData.id ? projectData : null;
  const isEditing = Boolean(currentProject);

  const backdrop = document.getElementById('project-modal-backdrop');
  const content = document.getElementById('project-modal-content');
  if (!backdrop || !content) return;

  const macroGoals = store.getMacroGoals();
  const activeCount = store.getActiveProjects().length;
  const canActivate = store.canActivateProject(currentProject ? currentProject.id : null);

  const selectedGoalId = currentProject
    ? currentProject.macroGoalId
    : projectData && projectData.macroGoalId
    ? projectData.macroGoalId
    : '';

  let goalsOptions = `<option value="">Sin Meta Macro asignada</option>`;
  macroGoals.forEach((g) => {
    const selected = g.id === selectedGoalId ? 'selected' : '';
    goalsOptions += `<option value="${g.id}" ${selected}>${escapeHtml(g.title)} (${g.quarter})</option>`;
  });

  const immediateAction = isEditing ? store.getImmediateNextAction(currentProject) : null;
  const defaultStatus = isEditing ? currentProject.status : (canActivate ? 'active' : 'frozen');

  content.innerHTML = `
    <button class="modal-close-btn" id="btn-close-project-modal">${icons.x}</button>

    <div class="view-header" style="margin-bottom:0;">
      <h2 class="view-title" style="font-size:1.2rem;">
        ${isEditing ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
      </h2>
      <p class="view-subtitle">
        ${isEditing ? 'Actualiza los parámetros e iniciativas del proyecto.' : 'Define una iniciativa atómica conectada a una meta.'}
      </p>
    </div>

    <form id="form-project-modal" style="display:flex; flex-direction:column; gap:14px;">
      <div class="form-group">
        <label class="form-label" for="proj-input-title">Título del Proyecto *</label>
        <input 
          type="text" 
          id="proj-input-title" 
          class="form-input" 
          placeholder="Ej: Lanzar nueva oferta comercial" 
          value="${isEditing ? escapeHtml(currentProject.title) : ''}" 
          required 
          autocomplete="off"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="proj-select-goal">Meta Macro Vinculada</label>
        <select id="proj-select-goal" class="form-select">
          ${goalsOptions}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label" for="proj-input-deadline">Fecha Límite</label>
        <input 
          type="date" 
          id="proj-input-deadline" 
          class="form-input" 
          value="${isEditing ? currentProject.deadline || '' : ''}"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="proj-select-status">Estado del Proyecto</label>
        <select id="proj-select-status" class="form-select">
          <option value="active" ${defaultStatus === 'active' ? 'selected' : ''}>
            🔥 Activo en Modo Foco ${!canActivate && defaultStatus !== 'active' ? '(WIP 2/2 lleno - bloqueará)' : ''}
          </option>
          <option value="frozen" ${defaultStatus === 'frozen' ? 'selected' : ''}>
            ❄️ The Freezer (En espera)
          </option>
          ${isEditing ? `<option value="completed" ${defaultStatus === 'completed' ? 'selected' : ''}>✅ Completado / Archivado</option>` : ''}
        </select>
        ${
          !canActivate && defaultStatus !== 'active'
            ? `<div style="font-size:0.75rem; color:#fbbf24; margin-top:4px;">
                ⚠️ Ya tienes 2 proyectos activos. Para poner este en Foco deberás pausar o completar uno.
               </div>`
            : ''
        }
      </div>

      <div class="form-group">
        <label class="form-label" for="proj-input-action">
          ${isEditing ? 'Añadir nueva tarea atómica' : 'Siguiente Acción Inmediata Inicial'}
        </label>
        <input 
          type="text" 
          id="proj-input-action" 
          class="form-input" 
          placeholder="Ej: Redactar esquema en Google Docs" 
          value="" 
          autocomplete="off"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="proj-input-desc">Notas / Contexto (Opcional)</label>
        <textarea 
          id="proj-input-desc" 
          class="form-textarea" 
          placeholder="Detalles clave para no olvidar..."
        >${isEditing ? escapeHtml(currentProject.description || '') : ''}</textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" id="btn-cancel-project-modal">Cancelar</button>
        <button type="submit" class="btn-submit">
          ${isEditing ? 'Guardar Cambios' : 'Crear Proyecto'}
        </button>
      </div>
    </form>
  `;

  // Attach event handlers
  document.getElementById('btn-close-project-modal').addEventListener('click', closeProjectModal);
  document.getElementById('btn-cancel-project-modal').addEventListener('click', closeProjectModal);

  document.getElementById('form-project-modal').addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('proj-input-title').value.trim();
    const macroGoalId = document.getElementById('proj-select-goal').value || null;
    const deadline = document.getElementById('proj-input-deadline').value;
    const status = document.getElementById('proj-select-status').value;
    const initialAction = document.getElementById('proj-input-action').value.trim();
    const description = document.getElementById('proj-input-desc').value.trim();

    if (!title) return;

    if (isEditing) {
      // Check WIP rule if moving to active
      if (status === 'active' && currentProject.status !== 'active' && !store.canActivateProject(currentProject.id)) {
        closeProjectModal();
        openWipLimitModal(() => {
          store.updateProject(currentProject.id, {
            title,
            macroGoalId,
            deadline,
            status: 'active',
            description
          });
          if (initialAction) store.addNextAction(currentProject.id, initialAction);
          showToast('Proyecto actualizado y activado', 'success');
        });
        return;
      }

      const res = store.updateProject(currentProject.id, {
        title,
        macroGoalId,
        deadline,
        status,
        description
      });

      if (!res.success && res.reason === 'WIP_LIMIT_REACHED') {
        closeProjectModal();
        openWipLimitModal();
        return;
      }

      if (initialAction) {
        store.addNextAction(currentProject.id, initialAction);
      }

      closeProjectModal();
      showToast('Proyecto actualizado', 'success');
    } else {
      // Creating new project
      if (status === 'active' && !store.canActivateProject()) {
        closeProjectModal();
        openWipLimitModal(() => {
          store.createProject({
            title,
            macroGoalId,
            deadline,
            status: 'active',
            initialAction,
            description
          });
          showToast('Proyecto creado y activado en Modo Foco 🎯', 'success');
        });
        return;
      }

      const res = store.createProject({
        title,
        macroGoalId,
        deadline,
        status,
        initialAction,
        description
      });

      if (!res.success && res.reason === 'WIP_LIMIT_REACHED') {
        closeProjectModal();
        openWipLimitModal();
        return;
      }

      closeProjectModal();
      showToast(status === 'active' ? 'Proyecto creado en Modo Foco 🎯' : 'Idea guardada en The Freezer ❄️', 'success');
    }
  });

  backdrop.classList.add('open');
}

export function closeProjectModal() {
  const backdrop = document.getElementById('project-modal-backdrop');
  if (backdrop) backdrop.classList.remove('open');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

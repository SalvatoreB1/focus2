// The Freezer View (Caja de ideas congeladas & Backlog)
import { store } from '../store.js';
import { icons } from '../icons.js';
import { sounds } from '../audio.js';
import { showToast } from './Toast.js';
import { openWipLimitModal } from './WipModal.js';

export function renderFreezerView(container, onNavigate, onEditProject) {
  const frozenProjects = store.getFrozenProjects();
  const macroGoals = store.getMacroGoals();
  const activeCount = store.getActiveProjects().length;

  let goalsOptionsHtml = `<option value="">Sin Meta Macro asignada</option>`;
  macroGoals.forEach((g) => {
    goalsOptionsHtml += `<option value="${g.id}">${escapeHtml(g.title)} (${g.quarter})</option>`;
  });

  let itemsHtml = '';
  if (frozenProjects.length === 0) {
    itemsHtml = `
      <div style="text-align:center; padding:40px 20px; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-lg); border:1px dashed var(--border-subtle);">
        <div style="font-size:2rem; margin-bottom:8px;">❄️</div>
        <div style="font-weight:700; color:#fff; margin-bottom:4px;">The Freezer está vacío</div>
        <div style="font-size:0.82rem; max-width:280px; margin:0 auto;">
          Anota aquí cualquier idea o proyecto que se te ocurra para no saturar tu mente mientras trabajas en tus 2 proyectos en curso.
        </div>
      </div>
    `;
  } else {
    itemsHtml = `
      <div class="frozen-items-list">
        ${frozenProjects
          .map((p) => {
            const goal = store.getGoalById(p.macroGoalId);
            const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Reciente';

            return `
            <div class="frozen-item-card" data-project-id="${p.id}">
              <div class="frozen-card-top">
                <div style="flex:1;">
                  <h3 class="frozen-title">${escapeHtml(p.title)}</h3>
                  ${
                    goal
                      ? `<div class="macro-goal-badge" style="margin-top:6px;">
                          <span class="goal-color-dot" style="background-color:${goal.color};"></span>
                          ${escapeHtml(goal.title)}
                         </div>`
                      : ''
                  }
                </div>
                <span class="frozen-date-pill">${dateStr}</span>
              </div>

              <div class="frozen-card-actions">
                <button class="btn-promote" data-action="promote-to-active" data-project-id="${p.id}">
                  ${icons.play} Promover a Activo
                </button>
                <div class="frozen-card-subactions">
                  <button class="icon-subaction" data-action="edit-frozen" data-project-id="${p.id}" title="Editar o detallar">
                    ${icons.edit}
                  </button>
                  <button class="icon-subaction delete" data-action="delete-frozen" data-project-id="${p.id}" title="Eliminar del freezer">
                    ${icons.trash}
                  </button>
                </div>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="freezer-container">
      <div class="view-header">
        <div class="view-title-row">
          <h1 class="view-title">
            <span style="color:#7dd3fc;">❄️</span> The Freezer
          </h1>
        </div>
        <p class="view-subtitle">
          Caja de captura de ideas congeladas. Guarda ideas de proyectos sin tareas ni fechas para evitar que te distraigan del foco actual.
        </p>
      </div>

      <!-- Quick 1-Click Capture Bar -->
      <div class="quick-capture-card">
        <div class="quick-capture-title">
          ${icons.snowflake} Captura rápida de idea (Sin fricción)
        </div>
        <form class="capture-form" id="form-quick-capture">
          <div class="capture-input-row">
            <input 
              type="text" 
              id="input-quick-idea" 
              class="capture-input" 
              placeholder="Nueva idea o proyecto..." 
              autocomplete="off"
              required
            />
            <button type="submit" class="btn-capture-submit">
              ${icons.plus} Congelar
            </button>
          </div>
          <select id="select-quick-goal" class="capture-goal-select">
            ${goalsOptionsHtml}
          </select>
        </form>
      </div>

      <!-- List of frozen projects -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
        <span style="font-size:0.78rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em;">
          Ideas congeladas en espera (${frozenProjects.length})
        </span>
      </div>

      ${itemsHtml}
    </div>
  `;

  // Attach event handlers
  // 1. Quick capture form submission
  const captureForm = container.querySelector('#form-quick-capture');
  if (captureForm) {
    captureForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = container.querySelector('#input-quick-idea');
      const select = container.querySelector('#select-quick-goal');
      const ideaTitle = input.value.trim();
      const goalId = select.value || null;

      if (ideaTitle) {
        store.addQuickIdea(ideaTitle, goalId);
        input.value = '';
        input.focus();
        showToast('Idea congelada en The Freezer ❄️', 'info');
      }
    });
  }

  // 2. Promote to active with WIP validation
  container.querySelectorAll('[data-action="promote-to-active"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const pid = btn.getAttribute('data-project-id');
      const result = store.activateProject(pid);

      if (!result.success && result.reason === 'WIP_LIMIT_REACHED') {
        openWipLimitModal(() => {
          onNavigate('focus');
        }, pid);
      } else if (result.success) {
        showToast('¡Proyecto activado! Abriendo Modo Foco 🎯', 'success');
        onNavigate('focus');
      }
    });
  });

  // 3. Edit frozen project
  container.querySelectorAll('[data-action="edit-frozen"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-project-id');
      const project = store.getProjectById(pid);
      if (project && onEditProject) {
        onEditProject(project);
      }
    });
  });

  // 4. Delete frozen project
  container.querySelectorAll('[data-action="delete-frozen"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-project-id');
      const project = store.getProjectById(pid);
      if (project && confirm(`¿Descartar la idea "${project.title}" de The Freezer?`)) {
        store.deleteProject(pid);
        showToast('Idea descartada', 'info');
      }
    });
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

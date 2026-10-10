// Macro Goals View (Objetivos a largo plazo / trimestrales)
import { store } from '../store.js';
import { icons } from '../icons.js';
import { sounds } from '../audio.js';
import { showToast } from './Toast.js';

export function renderMacroGoalsView(container, onOpenGoalModal, onOpenProjectModal) {
  const macroGoals = store.getMacroGoals();
  const allProjects = store.data.projects;

  let goalsListHtml = '';
  if (macroGoals.length === 0) {
    goalsListHtml = `
      <div style="text-align:center; padding:40px 20px; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-lg); border:1px dashed var(--border-subtle);">
        <div style="font-size:2rem; margin-bottom:8px;">🎯</div>
        <div style="font-weight:700; color:#fff; margin-bottom:4px;">No hay Metas Macro definidas</div>
        <div style="font-size:0.82rem; max-width:280px; margin:0 auto; margin-bottom:14px;">
          Define tus objetivos estratégicos trimestrales o anuales para conectar cada proyecto a una visión de alto nivel.
        </div>
        <button class="btn-submit" id="btn-create-first-goal">
          ${icons.plus} Crear Primera Meta Macro
        </button>
      </div>
    `;
  } else {
    goalsListHtml = `
      <div class="goals-list">
        ${macroGoals
          .map((goal) => {
            const projectsForGoal = allProjects.filter((p) => p.macroGoalId === goal.id);
            const activeCount = projectsForGoal.filter((p) => p.status === 'active').length;
            const frozenCount = projectsForGoal.filter((p) => p.status === 'frozen').length;
            const completedCount = projectsForGoal.filter((p) => p.status === 'completed').length;
            const total = projectsForGoal.length;
            const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;

            return `
            <div class="goal-card" style="border-left: 4px solid ${goal.color};">
              <div class="goal-card-top">
                <div style="flex:1;">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <span class="goal-quarter-pill">${escapeHtml(goal.quarter)}</span>
                  </div>
                  <h3 class="goal-title">${escapeHtml(goal.title)}</h3>
                  ${goal.description ? `<p class="goal-desc" style="margin-top:4px;">${escapeHtml(goal.description)}</p>` : ''}
                </div>
                <div style="display:flex; gap:4px;">
                  <button class="icon-subaction" data-action="edit-goal" data-goal-id="${goal.id}" title="Editar Meta">
                    ${icons.edit}
                  </button>
                  <button class="icon-subaction delete" data-action="delete-goal" data-goal-id="${goal.id}" title="Eliminar Meta">
                    ${icons.trash}
                  </button>
                </div>
              </div>

              <!-- Projects breakdown -->
              <div class="goal-stats-row">
                <span class="goal-stat-item"><strong>${activeCount}</strong> en foco</span>
                <span>•</span>
                <span class="goal-stat-item"><strong>${frozenCount}</strong> en freezer</span>
                <span>•</span>
                <span class="goal-stat-item"><strong>${completedCount}</strong> completados</span>
              </div>

              <div class="goal-progress-bar">
                <div class="goal-progress-fill" style="width: ${progress}%; background-color: ${goal.color};"></div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; padding-top:4px;">
                <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">${progress}% completado</span>
                <button class="btn-inline-add" data-action="new-project-for-goal" data-goal-id="${goal.id}">
                  ${icons.plus} Nuevo Proyecto
                </button>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="goals-container">
      <div class="view-header">
        <div class="view-title-row">
          <h1 class="view-title">
            <span style="color:#38bdf8;">🎯</span> Metas Macro
          </h1>
          <button class="btn-capture-submit" id="btn-add-macro-goal" style="padding: 7px 12px; font-size:0.8rem;">
            ${icons.plus} Nueva Meta
          </button>
        </div>
        <p class="view-subtitle">
          Estructura de objetivos a largo plazo / trimestrales que dan dirección estratégica a tus proyectos.
        </p>
      </div>

      ${goalsListHtml}
    </div>
  `;

  // Attach event handlers
  const addGoalBtn = container.querySelector('#btn-add-macro-goal');
  if (addGoalBtn) {
    addGoalBtn.addEventListener('click', () => onOpenGoalModal(null));
  }

  const createFirstBtn = container.querySelector('#btn-create-first-goal');
  if (createFirstBtn) {
    createFirstBtn.addEventListener('click', () => onOpenGoalModal(null));
  }

  container.querySelectorAll('[data-action="edit-goal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const gid = btn.getAttribute('data-goal-id');
      const goal = store.getGoalById(gid);
      if (goal) onOpenGoalModal(goal);
    });
  });

  container.querySelectorAll('[data-action="delete-goal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const gid = btn.getAttribute('data-goal-id');
      const goal = store.getGoalById(gid);
      if (goal && confirm(`¿Eliminar la Meta Macro "${goal.title}"? Sus proyectos quedarán sin meta asignada.`)) {
        store.deleteMacroGoal(gid);
        showToast('Meta Macro eliminada', 'info');
      }
    });
  });

  container.querySelectorAll('[data-action="new-project-for-goal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const gid = btn.getAttribute('data-goal-id');
      onOpenProjectModal({ macroGoalId: gid });
    });
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

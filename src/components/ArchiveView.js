// Archivo / Historial de Proyectos Terminados
import { store } from '../store.js';
import { icons } from '../icons.js';
import { sounds } from '../audio.js';
import { showToast } from './Toast.js';
import { openWipLimitModal } from './WipModal.js';

export function renderArchiveView(container, onNavigate) {
  const completedProjects = store.getCompletedProjects();
  const allProjects = store.data.projects;

  // Calculate stats
  const totalCompleted = completedProjects.length;
  let totalActionsCompleted = 0;
  allProjects.forEach((p) => {
    if (p.nextActions) {
      totalActionsCompleted += p.nextActions.filter((a) => a.completed).length;
    }
  });

  const completionRate =
    allProjects.length > 0 ? Math.round((totalCompleted / allProjects.length) * 100) : 0;

  let listHtml = '';
  if (completedProjects.length === 0) {
    listHtml = `
      <div style="text-align:center; padding:40px 20px; color:var(--text-muted); background:var(--bg-card); border-radius:var(--radius-lg); border:1px dashed var(--border-subtle);">
        <div style="font-size:2rem; margin-bottom:8px;">📦</div>
        <div style="font-weight:700; color:#fff; margin-bottom:4px;">No hay proyectos en el Archivo</div>
        <div style="font-size:0.82rem; max-width:280px; margin:0 auto;">
          Cuando completes uno de tus 2 proyectos activos en Modo Foco, quedará registrado aquí con su fecha de finalización.
        </div>
      </div>
    `;
  } else {
    listHtml = `
      <div class="archive-list">
        ${completedProjects
          .map((p) => {
            const goal = store.getGoalById(p.macroGoalId);
            const completedDateStr = p.completedAt
              ? new Date(p.completedAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Fecha no registrada';

            const actions = p.nextActions || [];

            return `
            <div class="archive-card" data-project-id="${p.id}">
              <div class="archive-card-header">
                <div style="flex:1;">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
                    <span class="completed-badge">
                      ${icons.check} Completado
                    </span>
                    <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">
                      ${completedDateStr}
                    </span>
                  </div>
                  <h3 class="archive-project-title">${escapeHtml(p.title)}</h3>
                  ${
                    goal
                      ? `<div class="macro-goal-badge" style="margin-top:6px;">
                          <span class="goal-color-dot" style="background-color:${goal.color};"></span>
                          ${escapeHtml(goal.title)}
                         </div>`
                      : ''
                  }
                </div>
              </div>

              <!-- Collapsible Completed Tasks Breakdown -->
              <details style="margin-top:8px; font-size:0.8rem; color:var(--text-secondary); cursor:pointer;">
                <summary style="font-weight:600; outline:none; user-select:none;">
                  Ver tareas ejecutadas (${actions.length})
                </summary>
                <div style="margin-top:8px; padding-left:8px; border-left:2px solid rgba(16, 185, 129, 0.3); display:flex; flex-direction:column; gap:4px;">
                  ${
                    actions.length > 0
                      ? actions
                          .map(
                            (a) => `
                        <div style="display:flex; align-items:center; gap:6px;">
                          <span style="color:#10b981;">✓</span>
                          <span style="color:${a.completed ? 'var(--text-muted)' : '#fff'}; text-decoration:${a.completed ? 'line-through' : 'none'};">
                            ${escapeHtml(a.text)}
                          </span>
                        </div>
                      `
                          )
                          .join('')
                      : '<div style="color:var(--text-muted);">Sin tareas registradas</div>'
                  }
                </div>
              </details>

              <div class="archive-card-actions-row">
                <button class="btn-archive-uncomplete" data-action="uncomplete-to-freezer" data-project-id="${p.id}">
                  ${icons.snowflake} <span>Mover a Freezer</span>
                </button>
                <button class="icon-subaction delete" data-action="delete-archived" data-project-id="${p.id}" title="Eliminar definitivamente">
                  ${icons.trash}
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
    <div class="archive-container">
      <div class="view-header">
        <div class="view-title-row">
          <h1 class="view-title">
            <span style="color:#10b981;">📦</span> Archivo de Proyectos
          </h1>
        </div>
        <p class="view-subtitle">
          Historial de proyectos terminados con fecha de finalización para visualizar el progreso real acumulado.
        </p>
      </div>

      <!-- Stats Summary Grid -->
      <div class="archive-stats-grid">
        <div class="stat-box">
          <span class="stat-number highlight">${totalCompleted}</span>
          <span class="stat-label">Completados</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${totalActionsCompleted}</span>
          <span class="stat-label">Tareas Hechas</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${completionRate}%</span>
          <span class="stat-label">Efectividad</span>
        </div>
      </div>

      ${listHtml}
    </div>
  `;

  // Attach event handlers
  container.querySelectorAll('[data-action="uncomplete-to-freezer"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-project-id');
      store.updateProject(pid, { status: 'frozen', completedAt: null });
      showToast('Proyecto movido de vuelta a The Freezer ❄️', 'info');
    });
  });

  container.querySelectorAll('[data-action="delete-archived"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-project-id');
      const project = store.getProjectById(pid);
      if (project && confirm(`¿Eliminar definitivamente "${project.title}" del archivo?`)) {
        store.deleteProject(pid);
        showToast('Proyecto eliminado', 'info');
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

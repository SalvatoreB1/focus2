// Modo Foco (Pantalla Principal - Radical Focus View)
import { store } from '../store.js';
import { icons } from '../icons.js';
import { sounds } from '../audio.js';
import { showToast } from './Toast.js';
import confetti from 'canvas-confetti';

export function renderFocusView(container, onNavigate, onOpenProjectModal) {
  const activeProjects = store.getActiveProjects();
  const maxSlots = 2;

  let cardsHtml = '';

  for (let slot = 0; slot < maxSlots; slot++) {
    const project = activeProjects[slot];

    if (project) {
      const goal = store.getGoalById(project.macroGoalId);
      const tasks = Array.isArray(project.nextActions) ? project.nextActions : [];
      const totalActions = tasks.length;
      const completedActions = tasks.filter((a) => a.completed).length;
      const progressPercent = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

      // Find first uncompleted task as the immediate focus
      let foundImmediate = false;

      // Deadline calculations
      let deadlineHtml = '';
      if (project.deadline) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(project.deadline + 'T00:00:00');
        const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

        let urgencyClass = '';
        let label = '';
        if (diffDays < 0) {
          urgencyClass = 'urgent';
          label = `Vencido (${Math.abs(diffDays)}d)`;
        } else if (diffDays === 0) {
          urgencyClass = 'urgent';
          label = 'Vence hoy';
        } else if (diffDays <= 3) {
          urgencyClass = 'soon';
          label = `Quedan ${diffDays} días`;
        } else {
          label = `Fecha: ${project.deadline}`;
        }

        deadlineHtml = `
          <div class="deadline-tag ${urgencyClass}">
            ${icons.calendar} ${label}
          </div>
        `;
      } else {
        deadlineHtml = `
          <div class="deadline-tag">
            ${icons.calendar} Sin fecha límite
          </div>
        `;
      }

      // Generate task items HTML
      let tasksListHtml = '';
      if (tasks.length === 0) {
        tasksListHtml = `
          <div style="padding:12px; text-align:center; color:var(--text-muted); font-size:0.82rem; background:#0d1424; border-radius:var(--radius-md); border:1px dashed rgba(255,255,255,0.08); margin-bottom:12px;">
            Sin pasos a corto plazo. Agrega el primer paso abajo para arrancar.
          </div>
        `;
      } else {
        tasksListHtml = tasks
          .map((task) => {
            const isImmediate = !task.completed && !foundImmediate;
            if (isImmediate) {
              foundImmediate = true;
            }

            return `
              <div class="project-task-item ${isImmediate ? 'immediate-focus-task' : ''}" data-task-wrapper="${task.id}">
                <div class="action-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle-task" data-project-id="${project.id}" data-action-id="${task.id}" title="${task.completed ? 'Marcar como pendiente' : 'Marcar como completada'}">
                  ${icons.check}
                </div>
                <div class="task-body">
                  ${isImmediate ? `<span class="immediate-badge">${icons.zap} Siguiente Acción Inmediata</span>` : ''}
                  <div class="task-text-content ${task.completed ? 'task-completed-text' : ''}" id="task-text-${task.id}">
                    ${escapeHtml(task.text)}
                  </div>
                </div>
                <div class="task-actions-group">
                  <button class="task-mini-btn" data-action="start-edit-task" data-project-id="${project.id}" data-action-id="${task.id}" title="Editar texto de la tarea">
                    ${icons.edit}
                  </button>
                  <button class="task-mini-btn delete" data-action="delete-task" data-project-id="${project.id}" data-action-id="${task.id}" title="Eliminar tarea">
                    ${icons.trash}
                  </button>
                </div>
              </div>
            `;
          })
          .join('');
      }

      cardsHtml += `
        <div class="slot-card" data-project-id="${project.id}">
          <div class="slot-header">
            <div style="display:flex; align-items:center; gap:8px; min-width:0; flex-wrap:wrap;">
              <span class="slot-number-tag">FOCO #${slot + 1} DE 2</span>
              ${
                goal
                  ? `<div class="macro-goal-badge" title="${escapeHtml(goal.title)}">
                      <span class="goal-color-dot" style="background-color: ${goal.color};"></span>
                      ${escapeHtml(goal.title)}
                     </div>`
                  : `<div class="macro-goal-badge">Sin Meta Macro</div>`
              }
            </div>
            <div style="display:flex; gap:4px; flex-shrink:0;">
              <button class="icon-subaction" data-action="edit-project" data-project-id="${project.id}" title="Editar proyecto">
                ${icons.edit}
              </button>
            </div>
          </div>

          <h2 class="project-title">${escapeHtml(project.title)}</h2>

          <div class="project-meta-row">
            ${deadlineHtml}
            ${project.description ? `<span class="project-desc-preview" title="${escapeHtml(project.description)}">${escapeHtml(project.description)}</span>` : ''}
          </div>

          <!-- Progress Bar -->
          <div class="tasks-progress-container">
            <div class="tasks-progress-header">
              <span class="tasks-progress-label">Pasos a Corto Plazo</span>
              <span class="action-count-pill">${completedActions}/${totalActions} completadas (${progressPercent}%)</span>
            </div>
            <div class="tasks-progress-track">
              <div class="tasks-progress-bar" style="width: ${progressPercent}%;"></div>
            </div>
          </div>

          <!-- Tasks List -->
          <div class="project-tasks-list">
            ${tasksListHtml}
          </div>

          <!-- Frictionless Inline Add Task Input -->
          <form class="inline-add-task-form" data-project-id="${project.id}">
            <input 
              type="text" 
              class="inline-task-input" 
              placeholder="+ Agregar paso o tarea a corto plazo (Enter)..." 
              autocomplete="off"
              required
            />
            <button type="submit" class="btn-inline-task-submit" title="Agregar tarea">
              ${icons.plus}
            </button>
          </form>

          <div class="slot-actions-row">
            <button class="btn-complete-project" data-action="complete-project" data-project-id="${project.id}">
              ${icons.check} Completar Proyecto
            </button>
            <button class="btn-freeze-project" data-action="freeze-project" data-project-id="${project.id}">
              ${icons.snowflake} Pausar / Freezer
            </button>
          </div>
        </div>
      `;
    } else {
      // Empty slot card
      cardsHtml += `
        <div class="slot-card-empty" data-action="fill-empty-slot" data-slot="${slot + 1}">
          <div class="slot-empty-icon">
            ${icons.plus}
          </div>
          <div class="slot-empty-title">Slot de Foco #${slot + 1} Disponible</div>
          <div class="slot-empty-desc">
            Tienes capacidad mental disponible. Promueve un proyecto desde The Freezer o añade uno nuevo.
          </div>
          <button class="btn-open-freezer-cta">
            ${icons.snowflake} Abrir The Freezer
          </button>
        </div>
      `;
    }
  }

  container.innerHTML = `
    <div class="focus-container">
      <div class="focus-mantra-bar">
        <div class="focus-mantra-icon">
          ${icons.zap}
        </div>
        <div class="focus-mantra-text">
          <strong>Regla de WIP = 2:</strong> Prohibido empezar un tercer proyecto sin terminar o pausar uno de estos dos.
        </div>
      </div>

      <div class="wip-slots-wrapper">
        ${cardsHtml}
      </div>
    </div>
  `;

  // Attach event handlers
  // 1. Toggle task checkbox
  container.querySelectorAll('[data-action="toggle-task"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = el.getAttribute('data-project-id');
      const aid = el.getAttribute('data-action-id');
      el.classList.toggle('checked');
      sounds.playActionComplete();
      setTimeout(() => {
        store.toggleNextAction(pid, aid);
      }, 120);
    });
  });

  // 2. Inline add task form submission (allows adding multiple tasks smoothly)
  container.querySelectorAll('.inline-add-task-form').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const pid = form.getAttribute('data-project-id');
      const input = form.querySelector('.inline-task-input');
      const text = input.value.trim();
      if (!text) return;

      store.addNextAction(pid, text);
      showToast('Paso añadido al foco 🎯', 'success', 1500);
      input.value = '';
      input.focus();
    });
  });

  // 3. Edit task text inline
  container.querySelectorAll('[data-action="start-edit-task"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute('data-project-id');
      const aid = btn.getAttribute('data-action-id');
      const project = store.getProjectById(pid);
      const task = project?.nextActions?.find((a) => a.id === aid);
      if (!task) return;

      const textEl = container.querySelector(`#task-text-${aid}`);
      const parentItem = container.querySelector(`[data-task-wrapper="${aid}"]`);
      if (!textEl || !parentItem) return;

      // Render inline input
      const currentText = task.text;
      textEl.innerHTML = `
        <form class="task-inline-edit-form" id="form-edit-${aid}">
          <input type="text" class="inline-edit-input" value="${escapeHtml(currentText)}" id="input-edit-${aid}" required />
          <button type="submit" class="btn-inline-save" title="Guardar">✓</button>
          <button type="button" class="btn-inline-cancel" id="cancel-edit-${aid}" title="Cancelar">✕</button>
        </form>
      `;

      const input = textEl.querySelector(`#input-edit-${aid}`);
      input.focus();
      input.select();

      const editForm = textEl.querySelector(`#form-edit-${aid}`);
      editForm.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const updated = input.value.trim();
        if (updated) {
          store.updateNextAction(pid, aid, updated);
          showToast('Tarea actualizada', 'info', 1500);
        }
      });

      const cancelBtn = textEl.querySelector(`#cancel-edit-${aid}`);
      cancelBtn.addEventListener('click', () => {
        textEl.textContent = currentText;
      });
    });
  });

  // 4. Delete task
  container.querySelectorAll('[data-action="delete-task"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute('data-project-id');
      const aid = btn.getAttribute('data-action-id');
      store.deleteNextAction(pid, aid);
      showToast('Tarea eliminada', 'info', 1500);
    });
  });

  // 5. Edit project directly from focus card
  container.querySelectorAll('[data-action="edit-project"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = btn.getAttribute('data-project-id');
      const proj = store.getProjectById(pid);
      if (proj && onOpenProjectModal) {
        onOpenProjectModal(proj);
      }
    });
  });

  // 6. Complete project
  container.querySelectorAll('[data-action="complete-project"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = el.getAttribute('data-project-id');
      const proj = store.getProjectById(pid);
      if (!proj) return;

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      store.completeProject(pid);
      showToast(`🎉 ¡Proyecto "${escapeHtml(proj.title)}" completado! Liberaste 1 slot de foco.`, 'success', 3500);
    });
  });

  // 7. Freeze project
  container.querySelectorAll('[data-action="freeze-project"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const pid = el.getAttribute('data-project-id');
      const proj = store.getProjectById(pid);
      if (!proj) return;

      store.freezeProject(pid);
      showToast(`Proyecto "${proj.title}" pausado y enviado a The Freezer.`, 'info');
    });
  });

  // 8. Fill empty slot
  container.querySelectorAll('[data-action="fill-empty-slot"]').forEach((el) => {
    el.addEventListener('click', () => {
      onNavigate('freezer');
    });
  });
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

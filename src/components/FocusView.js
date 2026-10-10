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
      const immediateAction = store.getImmediateNextAction(project);
      const totalActions = project.nextActions ? project.nextActions.length : 0;
      const completedActions = project.nextActions ? project.nextActions.filter((a) => a.completed).length : 0;

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

      // Immediate action section
      let actionBoxHtml = '';
      if (immediateAction) {
        actionBoxHtml = `
          <div class="immediate-action-box">
            <div class="action-box-label">
              <span class="action-box-title">${icons.zap} Siguiente Acción Inmediata</span>
              <span class="action-count-pill">${completedActions}/${totalActions} tareas</span>
            </div>
            <div class="immediate-action-item">
              <div class="action-checkbox" data-action="toggle-task" data-project-id="${project.id}" data-action-id="${immediateAction.id}">
                ${icons.check}
              </div>
              <div class="action-text">${escapeHtml(immediateAction.text)}</div>
            </div>
          </div>
        `;
      } else {
        actionBoxHtml = `
          <div class="immediate-action-box">
            <div class="action-box-label">
              <span class="action-box-title">${icons.zap} Siguiente Acción Inmediata</span>
            </div>
            <div class="no-action-state">
              <span>${totalActions > 0 ? '¡Todas las tareas actuales están listas!' : 'Sin acción atómica definida.'}</span>
              <button class="btn-inline-add" data-action="add-task-prompt" data-project-id="${project.id}">
                ${icons.plus} Añadir acción
              </button>
            </div>
          </div>
        `;
      }

      cardsHtml += `
        <div class="slot-card" data-project-id="${project.id}">
          <div class="slot-header">
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

          <h2 class="project-title">${escapeHtml(project.title)}</h2>

          <div class="project-meta-row">
            ${deadlineHtml}
          </div>

          ${actionBoxHtml}

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
        <div class="focus-mantra-text">
          <strong>Regla de WIP = 2:</strong> Prohibido empezar un tercer proyecto sin terminar o pausar uno de estos dos.
        </div>
        <div class="wip-badge ${activeProjects.length >= 2 ? 'full' : 'available'}">
          <span class="wip-dot"></span>
          ${activeProjects.length}/2 Activos
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
      const pid = el.getAttribute('data-project-id');
      const aid = el.getAttribute('data-action-id');
      el.classList.add('checked');
      sounds.playActionComplete();
      setTimeout(() => {
        store.toggleNextAction(pid, aid);
        showToast('¡Acción atómica completada!', 'success', 2000);
      }, 150);
    });
  });

  // 2. Add task prompt
  container.querySelectorAll('[data-action="add-task-prompt"]').forEach((el) => {
    el.addEventListener('click', () => {
      const pid = el.getAttribute('data-project-id');
      const actionText = prompt('Escribe la siguiente acción atómica e inmediata:');
      if (actionText && actionText.trim()) {
        store.addNextAction(pid, actionText.trim());
        showToast('Siguiente acción registrada', 'info');
      }
    });
  });

  // 3. Complete project
  container.querySelectorAll('[data-action="complete-project"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const pid = el.getAttribute('data-project-id');
      const proj = store.getProjectById(pid);
      if (!proj) return;

      if (confirm(`¿Confirmas que has completado el proyecto "${proj.title}"?`)) {
        // Trigger celebratory confetti blast
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (err) {}

        store.completeProject(pid);
        showToast(`🎉 ¡Proyecto completado y archivado! Liberaste 1 slot de WIP.`, 'success', 4000);
      }
    });
  });

  // 4. Freeze project
  container.querySelectorAll('[data-action="freeze-project"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const pid = el.getAttribute('data-project-id');
      const proj = store.getProjectById(pid);
      if (!proj) return;

      store.freezeProject(pid);
      showToast(`Proyecto "${proj.title}" pausado y enviado a The Freezer.`, 'info');
    });
  });

  // 5. Fill empty slot
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

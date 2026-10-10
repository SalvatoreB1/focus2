// Create & Edit Macro Goal Modal
import { store } from '../store.js';
import { icons } from '../icons.js';
import { showToast } from './Toast.js';

let currentGoal = null;

const COLOR_PALETTE = ['#38bdf8', '#10b981', '#f59e0b', '#a855f7', '#ec4899', '#06b6d4', '#6366f1'];

export function openMacroGoalModal(goalData = null) {
  currentGoal = goalData;
  const isEditing = Boolean(currentGoal);

  const backdrop = document.getElementById('goal-modal-backdrop');
  const content = document.getElementById('goal-modal-content');
  if (!backdrop || !content) return;

  const defaultColor = isEditing ? currentGoal.color : '#38bdf8';

  content.innerHTML = `
    <button class="modal-close-btn" id="btn-close-goal-modal">${icons.x}</button>

    <div class="view-header" style="margin-bottom:0;">
      <h2 class="view-title" style="font-size:1.2rem;">
        ${isEditing ? 'Editar Meta Macro' : 'Nueva Meta Macro'}
      </h2>
      <p class="view-subtitle">
        Objetivo trimestral o a largo plazo que orienta tus iniciativas.
      </p>
    </div>

    <form id="form-goal-modal" style="display:flex; flex-direction:column; gap:14px;">
      <div class="form-group">
        <label class="form-label" for="goal-input-title">Título de la Meta *</label>
        <input 
          type="text" 
          id="goal-input-title" 
          class="form-input" 
          placeholder="Ej: Facturación $10k/mes o Salud Óptima" 
          value="${isEditing ? escapeHtml(currentGoal.title) : ''}" 
          required 
          autocomplete="off"
        />
      </div>

      <div class="form-group">
        <label class="form-label" for="goal-input-quarter">Periodo / Horizonte</label>
        <input 
          type="text" 
          id="goal-input-quarter" 
          class="form-input" 
          placeholder="Ej: Q4 2026, Anual 2026..." 
          value="${isEditing ? escapeHtml(currentGoal.quarter || '') : 'Q4 2026'}" 
          autocomplete="off"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Color Distintivo</label>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:4px;">
          ${COLOR_PALETTE.map(
            (c) => `
            <label style="cursor:pointer; display:flex; align-items:center;">
              <input type="radio" name="goal-color" value="${c}" ${c === defaultColor ? 'checked' : ''} style="display:none;" />
              <span class="color-swatch" data-color="${c}" style="width:28px; height:28px; border-radius:50%; background-color:${c}; display:inline-block; border: 2px solid ${c === defaultColor ? '#fff' : 'transparent'}; box-shadow:0 0 8px ${c}55;"></span>
            </label>
          `
          ).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="goal-input-desc">Descripción / Criterio de Éxito</label>
        <textarea 
          id="goal-input-desc" 
          class="form-textarea" 
          placeholder="¿Cómo sabrás que esta meta se ha cumplido?"
        >${isEditing ? escapeHtml(currentGoal.description || '') : ''}</textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" id="btn-cancel-goal-modal">Cancelar</button>
        <button type="submit" class="btn-submit">
          ${isEditing ? 'Guardar Cambios' : 'Crear Meta Macro'}
        </button>
      </div>
    </form>
  `;

  // Attach event handlers
  document.getElementById('btn-close-goal-modal').addEventListener('click', closeMacroGoalModal);
  document.getElementById('btn-cancel-goal-modal').addEventListener('click', closeMacroGoalModal);

  // Swatch selection styling
  content.querySelectorAll('input[name="goal-color"]').forEach((input) => {
    input.addEventListener('change', (e) => {
      content.querySelectorAll('.color-swatch').forEach((s) => (s.style.borderColor = 'transparent'));
      const activeSwatch = content.querySelector(`.color-swatch[data-color="${e.target.value}"]`);
      if (activeSwatch) activeSwatch.style.borderColor = '#fff';
    });
  });

  document.getElementById('form-goal-modal').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('goal-input-title').value.trim();
    const quarter = document.getElementById('goal-input-quarter').value.trim();
    const selectedColorInput = content.querySelector('input[name="goal-color"]:checked');
    const color = selectedColorInput ? selectedColorInput.value : '#38bdf8';
    const description = document.getElementById('goal-input-desc').value.trim();

    if (!title) return;

    if (isEditing) {
      store.updateMacroGoal(currentGoal.id, { title, quarter, color, description });
      showToast('Meta Macro actualizada', 'success');
    } else {
      store.createMacroGoal({ title, quarter, color, description });
      showToast('Meta Macro creada', 'success');
    }

    closeMacroGoalModal();
  });

  backdrop.classList.add('open');
}

export function closeMacroGoalModal() {
  const backdrop = document.getElementById('goal-modal-backdrop');
  if (backdrop) backdrop.classList.remove('open');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

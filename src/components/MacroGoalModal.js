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
        <label class="form-label" for="goal-select-preset">Periodo / Horizonte Temporal</label>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
          <select id="goal-select-period-type" class="form-select">
            <option value="quarter">Trimestre (Q)</option>
            <option value="semester">Semestre (H)</option>
            <option value="annual">Anual</option>
            <option value="custom">Personalizado</option>
          </select>
          <select id="goal-select-year" class="form-select">
            <option value="2026" selected>Año 2026</option>
            <option value="2027">Año 2027</option>
            <option value="2028">Año 2028</option>
            <option value="2025">Año 2025</option>
          </select>
        </div>

        <div id="goal-period-options-row" style="display:flex; gap:6px;">
          <button type="button" class="btn-period-pill active" data-val="Q4">Q4 (Oct-Dic)</button>
          <button type="button" class="btn-period-pill" data-val="Q1">Q1 (Ene-Mar)</button>
          <button type="button" class="btn-period-pill" data-val="Q2">Q2 (Abr-Jun)</button>
          <button type="button" class="btn-period-pill" data-val="Q3">Q3 (Jul-Sep)</button>
        </div>

        <input 
          type="hidden" 
          id="goal-input-quarter" 
          value="${isEditing ? escapeHtml(currentGoal.quarter || 'Q4 2026') : 'Q4 2026'}" 
        />
        <div id="goal-period-preview" style="margin-top:6px; font-size:0.75rem; color:var(--text-accent); font-family:var(--font-mono); font-weight:700;">
          Horizonte: ${isEditing ? escapeHtml(currentGoal.quarter || 'Q4 2026') : 'Q4 2026'}
        </div>
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

  // Period / Horizon structured picker logic
  const typeSelect = document.getElementById('goal-select-period-type');
  const yearSelect = document.getElementById('goal-select-year');
  const optionsRow = document.getElementById('goal-period-options-row');
  const hiddenQuarter = document.getElementById('goal-input-quarter');
  const previewQuarter = document.getElementById('goal-period-preview');

  let currentSubPeriod = 'Q4';

  function updateHorizonString() {
    const pType = typeSelect.value;
    const year = yearSelect.value;
    let finalStr = '';

    if (pType === 'quarter') {
      finalStr = `${currentSubPeriod} ${year}`;
    } else if (pType === 'semester') {
      finalStr = `${currentSubPeriod} ${year}`;
    } else if (pType === 'annual') {
      finalStr = `Anual ${year}`;
    } else if (pType === 'custom') {
      finalStr = currentSubPeriod || `Horizonte ${year}`;
    }

    hiddenQuarter.value = finalStr;
    previewQuarter.textContent = `Horizonte: ${finalStr}`;
  }

  function renderPillsForType() {
    const pType = typeSelect.value;
    optionsRow.innerHTML = '';

    if (pType === 'quarter') {
      const qOptions = [
        { id: 'Q1', label: 'Q1 (Ene-Mar)' },
        { id: 'Q2', label: 'Q2 (Abr-Jun)' },
        { id: 'Q3', label: 'Q3 (Jul-Sep)' },
        { id: 'Q4', label: 'Q4 (Oct-Dic)' }
      ];
      if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(currentSubPeriod)) currentSubPeriod = 'Q4';

      qOptions.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-period-pill ${opt.id === currentSubPeriod ? 'active' : ''}`;
        btn.textContent = opt.label;
        btn.addEventListener('click', () => {
          currentSubPeriod = opt.id;
          optionsRow.querySelectorAll('.btn-period-pill').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          updateHorizonString();
        });
        optionsRow.appendChild(btn);
      });
    } else if (pType === 'semester') {
      const hOptions = [
        { id: 'H1', label: 'H1 (1er Semestre)' },
        { id: 'H2', label: 'H2 (2do Semestre)' }
      ];
      if (!['H1', 'H2'].includes(currentSubPeriod)) currentSubPeriod = 'H2';

      hOptions.forEach((opt) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `btn-period-pill ${opt.id === currentSubPeriod ? 'active' : ''}`;
        btn.textContent = opt.label;
        btn.addEventListener('click', () => {
          currentSubPeriod = opt.id;
          optionsRow.querySelectorAll('.btn-period-pill').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          updateHorizonString();
        });
        optionsRow.appendChild(btn);
      });
    } else if (pType === 'annual') {
      optionsRow.innerHTML = `<span style="font-size:0.75rem; color:var(--text-secondary);">Todo el ciclo del año fiscal seleccionado</span>`;
    } else if (pType === 'custom') {
      optionsRow.innerHTML = `
        <input type="text" id="custom-period-text" class="form-input" style="padding:6px 10px; font-size:0.8rem;" placeholder="Escribe tu rango (ej: Nov 2026 - Feb 2027)" value="${escapeHtml(currentSubPeriod)}" />
      `;
      const custInput = optionsRow.querySelector('#custom-period-text');
      custInput.addEventListener('input', (e) => {
        currentSubPeriod = e.target.value;
        updateHorizonString();
      });
    }
    updateHorizonString();
  }

  // Pre-parse existing quarter if editing
  if (isEditing && currentGoal.quarter) {
    const parts = currentGoal.quarter.split(' ');
    if (['Q1', 'Q2', 'Q3', 'Q4'].includes(parts[0])) {
      typeSelect.value = 'quarter';
      currentSubPeriod = parts[0];
      if (parts[1]) yearSelect.value = parts[1];
    } else if (['H1', 'H2'].includes(parts[0])) {
      typeSelect.value = 'semester';
      currentSubPeriod = parts[0];
      if (parts[1]) yearSelect.value = parts[1];
    } else if (parts[0] === 'Anual') {
      typeSelect.value = 'annual';
      if (parts[1]) yearSelect.value = parts[1];
    } else {
      typeSelect.value = 'custom';
      currentSubPeriod = currentGoal.quarter;
    }
  }

  renderPillsForType();
  typeSelect.addEventListener('change', () => renderPillsForType());
  yearSelect.addEventListener('change', () => updateHorizonString());

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

// Top App Bar Component
import { store } from '../store.js';
import { icons } from '../icons.js';
import { openBackupModal } from './BackupModal.js';
import { openApkModal } from './ApkModal.js';

export function renderHeader(container, onOpenProjectModal, onToggleWideMode, isWideMode) {
  const activeCount = store.getActiveProjects().length;
  const isFull = activeCount >= 2;

  container.innerHTML = `
    <header class="top-nav">
      <div class="brand-section">
        <div class="brand-logo" id="brand-logo-btn" style="cursor:pointer;">
          <div class="brand-logo-icon">2</div>
          <div class="brand-title">
            FOCUS<span>2</span>
          </div>
        </div>

        <div class="wip-badge ${isFull ? 'full' : 'available'}" title="${isFull ? 'Límite de WIP alcanzado' : 'Slots de foco disponibles'}">
          <span class="wip-dot"></span>
          ${activeCount}/2 Activos
        </div>
      </div>

      <div class="nav-actions">
        <button class="icon-btn ${isWideMode ? 'active' : ''}" id="btn-toggle-wide" title="${isWideMode ? 'Vista Móvil Estrecha' : 'Vista Expandida'}">
          ${icons.sparkles}
        </button>

        <button class="icon-btn" id="btn-open-backup" title="Exportar / Importar Respaldo JSON">
          ${icons.download}
        </button>

        <button class="icon-btn" id="btn-open-apk" title="Instalar en Móvil / APK">
          ${icons.android}
        </button>

        <button class="btn-capture-submit" id="btn-header-add-project" style="padding: 7px 12px; font-size: 0.8rem; margin-left: 2px;">
          ${icons.plus}
        </button>
      </div>
    </header>
  `;

  document.getElementById('btn-toggle-wide').addEventListener('click', () => {
    onToggleWideMode();
  });

  document.getElementById('btn-open-backup').addEventListener('click', () => {
    openBackupModal();
  });

  document.getElementById('btn-open-apk').addEventListener('click', () => {
    openApkModal();
  });

  document.getElementById('btn-header-add-project').addEventListener('click', () => {
    onOpenProjectModal(null);
  });
}

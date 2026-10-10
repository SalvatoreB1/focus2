// Top App Bar Component
import { store } from '../store.js';
import { icons } from '../icons.js';
import { openBackupModal } from './BackupModal.js';
import { openApkModal } from './ApkModal.js';

export function renderHeader(container, onOpenProjectModal, onToggleWideMode, isWideMode) {
  const activeCount = store.getActiveProjects().length;
  const isFull = activeCount >= 2;
  const isNative = typeof window !== 'undefined' && (window.Capacitor?.isNativePlatform?.() || false);

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
          <span class="wip-badge-text">${activeCount}/2 Activos</span>
        </div>
      </div>

      <div class="nav-actions">
        <button class="icon-btn desktop-only ${isWideMode ? 'active' : ''}" id="btn-toggle-wide" title="${isWideMode ? 'Vista Móvil Estrecha' : 'Vista Expandida'}">
          ${icons.sparkles}
        </button>

        ${!isNative ? `
        <button class="icon-btn desktop-only" id="btn-open-apk" title="Instalar en Móvil / APK">
          ${icons.android}
        </button>
        ` : ''}

        <button class="icon-btn" id="btn-open-backup" title="Exportar / Importar Respaldo JSON">
          ${icons.download}
        </button>
      </div>
    </header>
  `;

  const toggleWideBtn = document.getElementById('btn-toggle-wide');
  if (toggleWideBtn) {
    toggleWideBtn.addEventListener('click', () => {
      onToggleWideMode();
    });
  }

  const backupBtn = document.getElementById('btn-open-backup');
  if (backupBtn) {
    backupBtn.addEventListener('click', () => {
      openBackupModal();
    });
  }

  const apkBtn = document.getElementById('btn-open-apk');
  if (apkBtn) {
    apkBtn.addEventListener('click', () => {
      openApkModal();
    });
  }


}

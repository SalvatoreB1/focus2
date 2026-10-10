// Backup Modal (Exportar e Importar JSON)
import { store } from '../store.js';
import { icons } from '../icons.js';
import { showToast } from './Toast.js';

export function openBackupModal() {
  const backdrop = document.getElementById('backup-modal-backdrop');
  const content = document.getElementById('backup-modal-content');
  if (!backdrop || !content) return;

  content.innerHTML = `
    <button class="modal-close-btn" id="btn-close-backup-modal">${icons.x}</button>

    <div class="view-header" style="margin-bottom:0;">
      <h2 class="view-title" style="font-size:1.2rem;">
        Copia de Seguridad y Datos
      </h2>
      <p class="view-subtitle">
        Tus datos se guardan automáticamente en este dispositivo (localStorage). Aquí puedes exportar e importar respaldos.
      </p>
    </div>

    <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px;">
      <button class="btn-complete-project" id="btn-export-json" style="background:linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
        ${icons.download} Exportar Respaldo JSON
      </button>

      <div style="position:relative;">
        <input type="file" id="input-import-file" accept=".json" style="display:none;" />
        <button class="btn-freeze-project" id="btn-trigger-import" style="width:100%;">
          ${icons.upload} Importar Respaldo JSON
        </button>
      </div>

      <div style="border-top:1px solid rgba(255,255,255,0.06); padding-top:10px; margin-top:4px;">
        <button class="btn-cancel" id="btn-reset-demo" style="width:100%; color:#f87171; border-color:rgba(239, 68, 68, 0.3);">
          ${icons.refresh} Restaurar Datos de Ejemplo
        </button>
      </div>
    </div>
  `;

  document.getElementById('btn-close-backup-modal').addEventListener('click', closeBackupModal);

  document.getElementById('btn-export-json').addEventListener('click', () => {
    store.exportToJson();
    showToast('Copia de seguridad JSON descargada con éxito 📥', 'success');
    closeBackupModal();
  });

  const importInput = document.getElementById('input-import-file');
  document.getElementById('btn-trigger-import').addEventListener('click', () => {
    importInput.click();
  });

  importInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      const res = store.importFromJson(content);
      if (res.success) {
        showToast(`Se importaron ${res.count} proyectos correctamente ✅`, 'success');
        closeBackupModal();
      } else {
        showToast(`Error al importar: ${res.error}`, 'warning', 4000);
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-reset-demo').addEventListener('click', () => {
    if (confirm('¿Deseas restaurar los datos de ejemplo iniciales?')) {
      store.resetToDemoData();
      showToast('Datos de demostración restaurados', 'info');
      closeBackupModal();
    }
  });

  backdrop.classList.add('open');
}

export function closeBackupModal() {
  const backdrop = document.getElementById('backup-modal-backdrop');
  if (backdrop) backdrop.classList.remove('open');
}

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
        ${icons.download} Descargar Archivo JSON
      </button>

      <button class="btn-inline-add" id="btn-copy-json" style="width:100%; justify-content:center; padding:10px; background:#0d1527; color:#38bdf8; border:1px solid rgba(56,189,248,0.3); border-radius:var(--radius-md); font-weight:700;">
        📋 Copiar JSON al Portapapeles
      </button>

      <div style="position:relative;">
        <input type="file" id="input-import-file" accept=".json,application/json,text/plain" style="display:none;" />
        <button class="btn-freeze-project" id="btn-trigger-import" style="width:100%;">
          ${icons.upload} Importar Archivo JSON
        </button>
      </div>

      <button class="btn-inline-add" id="btn-paste-import" style="width:100%; justify-content:center; padding:10px; background:#0d1527; color:#10b981; border:1px solid rgba(16,185,129,0.3); border-radius:var(--radius-md); font-weight:700;">
        📥 Pegar Texto JSON para Restaurar
      </button>

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
  });

  document.getElementById('btn-copy-json').addEventListener('click', () => {
    const raw = store.getExportJsonString();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(raw).then(() => {
        showToast('¡JSON copiado al portapapeles! 📋 Guárdalo en tus notas', 'success', 3500);
      }).catch(() => {
        prompt('Copia este texto JSON de respaldo:', raw);
      });
    } else {
      prompt('Copia este texto JSON de respaldo:', raw);
    }
  });

  document.getElementById('btn-paste-import').addEventListener('click', () => {
    const pasted = prompt('Pega aquí el texto JSON de respaldo que copiaste anteriormente:');
    if (!pasted || !pasted.trim()) return;
    const res = store.importFromJson(pasted.trim());
    if (res.success) {
      showToast(`¡Restaurado con éxito! Se cargaron ${res.count} proyectos ✅`, 'success', 3500);
      closeBackupModal();
    } else {
      showToast(`Error al importar: ${res.error}`, 'warning', 4000);
    }
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

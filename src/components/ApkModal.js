// APK & Mobile Installation Modal
import { icons } from '../icons.js';
import { showToast } from './Toast.js';

let deferredPrompt = null;

// Catch Android PWA installation prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBanner = document.getElementById('pwa-install-banner');
  if (installBanner) installBanner.style.display = 'flex';
});

export function openApkModal() {
  const backdrop = document.getElementById('apk-modal-backdrop');
  const content = document.getElementById('apk-modal-content');
  if (!backdrop || !content) return;

  content.innerHTML = `
    <button class="modal-close-btn" id="btn-close-apk-modal">${icons.x}</button>

    <div class="view-header" style="margin-bottom:0;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="color:#10b981;">${icons.android}</span>
        <h2 class="view-title" style="font-size:1.2rem;">
          Instalar en tu Móvil (APK / PWA)
        </h2>
      </div>
      <p class="view-subtitle">
        Opciones disponibles para tener FOCUS2 en tu smartphone como aplicación independiente.
      </p>
    </div>

    <div style="display:flex; flex-direction:column; gap:14px; margin-top:10px;">
      <!-- Descarga Directa del APK Generado -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(56, 189, 248, 0.15) 100%); border:1px solid rgba(16, 185, 129, 0.4); border-radius:var(--radius-md); padding:14px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <span style="font-weight:700; color:#34d399; font-size:0.92rem;">APK Compilado y Listo</span>
          <span style="font-size:0.68rem; background:rgba(16, 185, 129, 0.25); color:#10b981; padding:2px 8px; border-radius:12px; font-weight:800;">4.0 MB</span>
        </div>
        <p style="font-size:0.78rem; color:var(--text-secondary); line-height:1.4; margin-bottom:10px;">
          Tu archivo APK nativo de Android ha sido compilado con éxito. Puedes descargarlo e instalarlo de inmediato en tu smartphone Android:
        </p>
        <a href="/focus2-debug.apk" download="focus2-debug.apk" class="btn-complete-project" style="text-decoration:none; text-align:center; width:100%; box-sizing:border-box;">
          ${icons.download} Descargar focus2-debug.apk
        </a>
      </div>

      <!-- Opción 1: WebAPK Inmediata -->
      <div style="background:var(--bg-card); border:1px solid rgba(56, 189, 248, 0.3); border-radius:var(--radius-md); padding:14px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <span style="font-weight:700; color:#38bdf8; font-size:0.88rem;">Instalación PWA / WebAPK en Chrome</span>
          <span style="font-size:0.68rem; background:rgba(56, 189, 248, 0.2); color:#38bdf8; padding:2px 8px; border-radius:12px; font-weight:800;">SIN CABLES</span>
        </div>
        <p style="font-size:0.78rem; color:var(--text-secondary); line-height:1.4; margin-bottom:10px;">
          Si abres esta app en el navegador de tu móvil, pulsa el menú (⋮) y selecciona "Instalar aplicación". Android crea un WebAPK instantáneo.
        </p>
        <button class="btn-freeze-project" id="btn-trigger-pwa-install" style="width:100%; font-size:0.8rem; padding:9px;">
          ${icons.phone} Instalar PWA en este Dispositivo
        </button>
      </div>

      <!-- Opción 2: Compilar APK con Capacitor -->
      <div style="background:var(--bg-card); border:1px solid var(--border-medium); border-radius:var(--radius-md); padding:14px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <span style="font-weight:700; color:#38bdf8; font-size:0.88rem;">2. Compilar Archivo .APK Nativo</span>
          <span style="font-size:0.68rem; background:rgba(56, 189, 248, 0.2); color:#38bdf8; padding:2px 8px; border-radius:12px; font-weight:800;">CAPACITOR</span>
        </div>
        <p style="font-size:0.78rem; color:var(--text-secondary); line-height:1.4; margin-bottom:8px;">
          El proyecto ya incluye la configuración completa de <strong>Capacitor</strong> para Android. Para generar el archivo APK:
        </p>
        <div style="background:#090d16; border-radius:8px; padding:10px; font-family:var(--font-mono); font-size:0.75rem; color:#a5f3fc; line-height:1.5; border:1px solid rgba(255,255,255,0.06);">
          # 1. Compilar bundle web<br>
          <span style="color:#fbbf24;">npm run build</span><br><br>
          # 2. Inicializar proyecto Android<br>
          <span style="color:#fbbf24;">npx cap add android</span><br><br>
          # 3. Sincronizar y compilar<br>
          <span style="color:#fbbf24;">npx cap sync</span><br>
          <span style="color:#fbbf24;">npx cap open android</span>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-close-apk-modal').addEventListener('click', closeApkModal);

  document.getElementById('btn-trigger-pwa-install').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        showToast('Instalación aceptada 🎉', 'success');
      }
      deferredPrompt = null;
    } else {
      showToast('En el navegador de tu móvil, pulsa el menú (⋮) y selecciona "Instalar aplicación" o "Añadir a la pantalla de inicio".', 'info', 5000);
    }
  });

  backdrop.classList.add('open');
}

export function closeApkModal() {
  const backdrop = document.getElementById('apk-modal-backdrop');
  if (backdrop) backdrop.classList.remove('open');
}

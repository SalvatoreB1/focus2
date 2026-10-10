# FOCUS2 — Gestión Radical de Metas y Proyectos (WIP Estricto = 2)

> **"Termina antes de empezar. El cerebro no puede hacer multitask de proyectos."**

FOCUS2 es una aplicación móvil diseñada específicamente para erradicar la procrastinación y la sobrecarga cognitiva aplicando una **restricción dura de WIP (Work In Progress) de máximo 2 proyectos activos simultáneamente**, complementada por **The Freezer** (caja de ideas congeladas sin tareas ni fechas).

---

## 📱 Archivo APK Listo para Instalar en tu Móvil

El archivo binario APK nativo para Android ya ha sido compilado y se encuentra listo en este directorio:

- **Ruta del APK:** [`focus2-debug.apk`](file:///home/biwan1/Downloads/Visio/focus2-debug.apk) (o en [`android/app/build/outputs/apk/debug/app-debug.apk`](file:///home/biwan1/Downloads/Visio/android/app/build/outputs/apk/debug/app-debug.apk))
- **Tamaño:** ~4.0 MB
- **Compatibilidad:** Android 7.0 (API 24) hasta Android 16 (API 36).

### ¿Cómo instalar el APK en tu móvil?
1. **Transfiere el archivo a tu teléfono:**
   - Puedes enviártelo por Telegram, WhatsApp Web, Google Drive, Nextcloud, o conectando tu cable USB y copiando el archivo [`focus2-debug.apk`](file:///home/biwan1/Downloads/Visio/focus2-debug.apk) a la carpeta `Descargas` de tu móvil.
   - O si tu móvil está en la misma red Wi-Fi, abre el navegador en tu móvil y descarga el archivo directamente.
2. **Instalar:**
   - Abre el explorador de archivos en tu móvil, pulsa sobre `focus2-debug.apk`.
   - Si Android te pide confirmación de "Instalar aplicaciones de fuentes desconocidas", pulsa **Permitir**.
   - ¡Listo! Se instalará como una aplicación nativa con su icono oficial.

### Método Alternativo: Instalación Inmediata PWA (Sin Cables)
FOCUS2 incluye **Service Worker** (`sw.js`) y manifiesto PWA (`manifest.webmanifest`):
1. Inicia el servidor local: `npm run dev`
2. Abre la URL en el navegador de tu móvil (ej. Google Chrome).
3. Pulsa el menú de opciones de Chrome (**⋮**) y selecciona **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"**.
4. Android creará automáticamente un WebAPK nativo e independiente.

---

## 🛠️ Reglas de Negocio Implementadas

### 1. Estructura Jerárquica de 3 Niveles
- **Metas Macro:** Objetivos de alto impacto (trimestrales / anuales) con horizonte temporal, color distintivo y métricas de avance.
- **Proyectos:** Iniciativas con fecha límite asociadas a una meta macro. Estados: `Activo` (Modo Foco), `En Pausa / Congelado` (The Freezer), y `Completado` (Archivo).
- **Siguiente Acción:** Tareas atómicas secuenciales. En la tarjeta de foco solo se expone **una única acción inmediata pendiente** para evitar abrumar al usuario.

### 2. Restricción Dura de WIP (Máximo 2 Proyectos Activos)
- El sistema **bloquea terminantemente** que existan más de 2 proyectos en estado "Activo".
- Si el usuario intenta promover una tercera idea desde The Freezer, despausar un proyecto o crear un proyecto nuevo con estado activo cuando ya hay 2 en curso, se despliega una alerta modal de rechazo con sonido y vibración háptica:
  > *"Límite de WIP alcanzado (máximo 2 proyectos activos). Debes completar o pausar uno antes de iniciar otro."*
- La modal ofrece resolución en 1 clic: permite pausar directamente cualquiera de los dos proyectos activos para liberar el slot.

### 3. The Freezer (Caja de Ideas Congeladas)
- Sección de captura ultrarrápida sin fricción (campo de 1 clic + Enter) para anotar ideas futuras sin fechas ni tareas pendientes, permitiendo vaciar la mente sin distraerse del trabajo en curso.
- Botón **"Promover a Activo"** con validación estricta de la regla de WIP.

### 4. Modo Foco (Pantalla Principal)
- Solo muestra los 2 slots de foco.
- Si un slot está libre, muestra una tarjeta receptora invitando a asignar capacidad mental.
- Cada tarjeta muestra:
  - Título y etiqueta de Meta Macro.
  - Indicador de urgencia de la fecha límite (días restantes / vencimiento).
  - Caja de **Siguiente Acción Inmediata** con checkbox táctil. Al completarla, reproduce sonido de éxito y revela la siguiente acción de la cola.
  - Botón directo **"Completar Proyecto"** (lanza confeti, reproduce melodía de victoria y archiva).
  - Botón directo **"Pausar / Enviar a Freezer"** (libera el slot de inmediato).

### 5. Archivo / Historial
- Lista colapsable con fecha de finalización exacta y desglose de tareas ejecutadas.
- Métricas de efectividad: Proyectos completados, total de acciones ejecutadas y tasa de éxito.

### 6. Persistencia y Respaldo
- Todo el estado se sincroniza en `localStorage` en tiempo real.
- Botones discretos en la barra superior para:
  - **Exportar JSON:** Descarga un archivo con timestamp (`focus2_backup_YYYY-MM-DD.json`).
  - **Importar JSON:** Carga respaldos previos con validación de esquema.
  - **Restaurar demo:** Reinicia los datos iniciales de ejemplo si se desea.

---

## 💻 Comandos del Proyecto

```bash
# Iniciar servidor de desarrollo local
npm run dev

# Compilar para producción (Vite)
npm run build

# Sincronizar bundle web con Android Capacitor
npm run cap:sync

# Recompilar el archivo APK de Android automáticamente
./build-apk.sh
```

---

## 📁 Estructura del Código

```
Visio/
├── focus2-debug.apk             # Binario APK listo para instalar en Android
├── build-apk.sh                 # Script automatizado de compilación de APK
├── package.json                 # Dependencias y scripts de construcción
├── capacitor.config.json        # Configuración nativa de Capacitor Android
├── vite.config.js               # Configuración del empaquetador Vite
├── index.html                   # Entrada HTML con viewport móvil PWA
│
├── public/                      # Activos estáticos, iconos y PWA
│   ├── favicon.svg              # Icono SVG vectorial de alta resolución
│   ├── icon-192.png             # Icono PWA Android (192x192)
│   ├── icon-512.png             # Icono PWA Android (512x512)
│   ├── manifest.webmanifest     # Manifiesto de instalación PWA
│   └── sw.js                    # Service Worker con soporte offline total
│
├── src/
│   ├── index.css                # Sistema de diseño sobrio / Dark Focus Theme
│   ├── main.js                  # Enrutamiento móvil y orquestador reactivo
│   ├── store.js                 # Estado con regla estricta de WIP y localStorage
│   ├── audio.js                 # Sintetizador Web Audio API y vibración háptica
│   ├── icons.js                 # Biblioteca de iconos SVG ligeros
│   └── components/
│       ├── Header.js            # Barra superior, badge de WIP y accesos
│       ├── FocusView.js         # Vista de Modo Foco (máximo 2 slots)
│       ├── FreezerView.js       # The Freezer y barra de captura en 1 clic
│       ├── ArchiveView.js       # Historial de proyectos terminados
│       ├── MacroGoalsView.js    # Gestión de objetivos trimestrales
│       ├── WipModal.js          # Modal de rechazo estricto de límite WIP
│       ├── ProjectModal.js      # Modal de creación y edición de proyectos
│       ├── MacroGoalModal.js    # Modal de creación y edición de metas
│       ├── BackupModal.js       # Exportación e importación de respaldos JSON
│       ├── ApkModal.js          # Guía y descarga del APK en la aplicación
│       └── Toast.js             # Notificaciones toast flotantes
│
└── android/                     # Proyecto nativo Gradle / Android Studio
    ├── app/
    │   └── build/outputs/apk/debug/app-debug.apk
    ├── build.gradle
    └── variables.gradle
```

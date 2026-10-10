// Main Application Entry Point
import './index.css';
import { store } from './store.js';
import { icons } from './icons.js';
import { renderHeader } from './components/Header.js';
import { renderFocusView } from './components/FocusView.js';
import { renderFreezerView } from './components/FreezerView.js';
import { renderArchiveView } from './components/ArchiveView.js';
import { renderMacroGoalsView } from './components/MacroGoalsView.js';
import { openProjectModal } from './components/ProjectModal.js';
import { openMacroGoalModal } from './components/MacroGoalModal.js';
import { initToastContainer } from './components/Toast.js';

let currentTab = 'focus';
let isWideMode = false;

// Initialize app DOM
function initApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  appContainer.innerHTML = `
    <div class="app-viewport" id="viewport">
      <div id="header-container"></div>
      
      <main class="app-content" id="main-content"></main>

      <nav class="bottom-nav" id="bottom-navigation">
        <button class="nav-item active" data-tab="focus">
          <div class="nav-item-icon">${icons.target}</div>
          <span class="nav-item-label">Foco</span>
        </button>

        <button class="nav-item" data-tab="freezer">
          <div class="nav-item-icon">${icons.snowflake}</div>
          <span class="nav-item-label">Freezer</span>
          <span class="nav-badge-count" id="badge-freezer-count">0</span>
        </button>

        <button class="nav-item" data-tab="archive">
          <div class="nav-item-icon">${icons.archive}</div>
          <span class="nav-item-label">Archivo</span>
        </button>

        <button class="nav-item" data-tab="goals">
          <div class="nav-item-icon">${icons.goals}</div>
          <span class="nav-item-label">Metas</span>
        </button>
      </nav>
    </div>

    <!-- Modals Host Container -->
    <div class="modal-backdrop" id="wip-modal-backdrop">
      <div class="modal-window" id="wip-modal-content"></div>
    </div>

    <div class="modal-backdrop" id="project-modal-backdrop">
      <div class="modal-window" id="project-modal-content"></div>
    </div>

    <div class="modal-backdrop" id="goal-modal-backdrop">
      <div class="modal-window" id="goal-modal-content"></div>
    </div>

    <div class="modal-backdrop" id="backup-modal-backdrop">
      <div class="modal-window" id="backup-modal-content"></div>
    </div>

    <div class="modal-backdrop" id="apk-modal-backdrop">
      <div class="modal-window" id="apk-modal-content"></div>
    </div>
  `;

  initToastContainer();
  setupNavigation();
  render();

  // Subscribe to store updates for reactive re-render
  store.subscribe(() => {
    render();
  });

  // Register Service Worker for PWA only when on HTTP/HTTPS web, avoiding file/capacitor scheme conflicts
  if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }
}

// Global error boundary to prevent black/blank screens
window.addEventListener('error', (event) => {
  console.error('Unhandled app error:', event.error);
  const appContainer = document.getElementById('app');
  if (appContainer && (!appContainer.children || appContainer.children.length === 0)) {
    // If screen is blank due to an error, attempt fallback render
    try {
      localStorage.removeItem('FOCUS2_STATE_v1');
      initApp();
    } catch (e) {}
  }
});

function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      navigateTo(tab);
    });
  });

  // Clicking brand logo in header returns to Focus view
  document.addEventListener('click', (e) => {
    if (e.target.closest('#brand-logo-btn')) {
      navigateTo('focus');
    }
  });
}

export function navigateTo(tab) {
  currentTab = tab;
  document.querySelectorAll('.nav-item').forEach((btn) => {
    if (btn.getAttribute('data-tab') === tab) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  renderCurrentView();
}

function toggleWideMode() {
  isWideMode = !isWideMode;
  const viewport = document.getElementById('viewport');
  if (viewport) {
    if (isWideMode) {
      viewport.classList.add('wide-mode');
    } else {
      viewport.classList.remove('wide-mode');
    }
  }
  renderHeaderContainer();
}

function renderHeaderContainer() {
  const headerContainer = document.getElementById('header-container');
  if (headerContainer) {
    renderHeader(
      headerContainer,
      (project) => openProjectModal(project),
      () => toggleWideMode(),
      isWideMode
    );
  }
}

function renderCurrentView() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  // Scroll to top on view change
  mainContent.scrollTop = 0;

  if (currentTab === 'focus') {
    renderFocusView(
      mainContent,
      (tab) => navigateTo(tab),
      (project) => openProjectModal(project)
    );
  } else if (currentTab === 'freezer') {
    renderFreezerView(
      mainContent,
      (tab) => navigateTo(tab),
      (project) => openProjectModal(project)
    );
  } else if (currentTab === 'archive') {
    renderArchiveView(mainContent, (tab) => navigateTo(tab));
  } else if (currentTab === 'goals') {
    renderMacroGoalsView(
      mainContent,
      (goal) => openMacroGoalModal(goal),
      (project) => openProjectModal(project)
    );
  }
}

function updateBadges() {
  const badgeFreezer = document.getElementById('badge-freezer-count');
  if (badgeFreezer) {
    const frozenCount = store.getFrozenProjects().length;
    badgeFreezer.textContent = frozenCount;
    badgeFreezer.style.display = frozenCount > 0 ? 'inline-block' : 'none';
  }
}

function render() {
  renderHeaderContainer();
  renderCurrentView();
  updateBadges();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

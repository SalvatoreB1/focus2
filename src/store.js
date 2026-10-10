// FOCUS2 State Management Store with localStorage Persistence & Strict WIP Rule (Max 2 Active)
import { sounds } from './audio.js';

const STORAGE_KEY = 'FOCUS2_STATE_v1';

const DEFAULT_MACRO_GOALS = [
  {
    id: 'goal-1',
    title: 'Facturación & Negocios Q4',
    description: 'Consolidar ingresos recurrentes y cerrar acuerdos clave con clientes.',
    quarter: 'Q4 2026',
    color: '#38bdf8', // Ice blue
    createdAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'goal-2',
    title: 'Salud & Rendimiento Físico',
    description: 'Entrenamiento de fuerza, resistencia cardiovascular y optimización de sueño.',
    quarter: 'Anual 2026',
    color: '#10b981', // Emerald
    createdAt: '2026-10-01T10:00:00.000Z'
  },
  {
    id: 'goal-3',
    title: 'Aprendizaje & Maestría Técnica',
    description: 'Adquisición de habilidades de alto apalancamiento y lectura estructurada.',
    quarter: 'Q4 2026',
    color: '#a855f7', // Purple
    createdAt: '2026-10-01T10:00:00.000Z'
  }
];

const DEFAULT_PROJECTS = [
  {
    id: 'proj-1',
    macroGoalId: 'goal-1',
    title: 'Lanzar Landing Page de Consultoría',
    description: 'Página de alta conversión con propuesta clara y botón de agendamiento.',
    deadline: '2026-10-24',
    status: 'active',
    nextActions: [
      { id: 'act-101', text: 'Redactar el titular y propuesta de valor en borrador', completed: false, createdAt: '2026-10-08T09:00:00.000Z' },
      { id: 'act-102', text: 'Diseñar wireframe de testimonios y caso de estudio', completed: false, createdAt: '2026-10-08T09:05:00.000Z' },
      { id: 'act-103', text: 'Integrar pasarela de cobro y calendario', completed: false, createdAt: '2026-10-08T09:10:00.000Z' }
    ],
    createdAt: '2026-10-08T09:00:00.000Z',
    activatedAt: '2026-10-08T09:00:00.000Z',
    completedAt: null
  },
  {
    id: 'proj-2',
    macroGoalId: 'goal-2',
    title: 'Preparación y Plan Carrera 10K',
    description: 'Rutina de 4 semanas de progresión de ritmo y chequeo fisiológico.',
    deadline: '2026-11-08',
    status: 'active',
    nextActions: [
      { id: 'act-201', text: 'Agendar cita médica para prueba de esfuerzo preventivo', completed: false, createdAt: '2026-10-09T11:00:00.000Z' },
      { id: 'act-202', text: 'Definir plan semanal de tiradas de 5km y 8km', completed: false, createdAt: '2026-10-09T11:05:00.000Z' }
    ],
    createdAt: '2026-10-09T11:00:00.000Z',
    activatedAt: '2026-10-09T11:00:00.000Z',
    completedAt: null
  },
  {
    id: 'proj-3',
    macroGoalId: 'goal-1',
    title: 'Automatizar pipeline de captación por Email',
    description: 'Secuencia de nutrición de 5 correos automatizados para prospectos calificados.',
    deadline: '',
    status: 'frozen',
    nextActions: [],
    createdAt: '2026-10-07T14:30:00.000Z',
    activatedAt: null,
    completedAt: null
  },
  {
    id: 'proj-4',
    macroGoalId: 'goal-3',
    title: 'Migrar base de conocimiento personal a Obsidian',
    description: 'Unificar notas dispersas en un sistema Zettelkasten interconectado.',
    deadline: '',
    status: 'frozen',
    nextActions: [],
    createdAt: '2026-10-06T18:20:00.000Z',
    activatedAt: null,
    completedAt: null
  },
  {
    id: 'proj-5',
    macroGoalId: 'goal-1',
    title: 'Diseñar propuesta de servicio recurrente (Retainer)',
    description: 'Estructurar catálogo de entregables y contrato estándar.',
    deadline: '',
    status: 'frozen',
    nextActions: [],
    createdAt: '2026-10-05T12:00:00.000Z',
    activatedAt: null,
    completedAt: null
  },
  {
    id: 'proj-6',
    macroGoalId: 'goal-1',
    title: 'Auditoría de suscripciones y optimización de costes',
    description: 'Revisión minuciosa de software y servicios para recortar gastos innecesarios.',
    deadline: '2026-10-04',
    status: 'completed',
    nextActions: [
      { id: 'act-601', text: 'Revisar extractos bancarios del último trimestre', completed: true, completedAt: '2026-10-04T12:00:00.000Z' },
      { id: 'act-602', text: 'Cancelar suscripciones duplicadas y renegociar planes', completed: true, completedAt: '2026-10-04T15:30:00.000Z' }
    ],
    createdAt: '2026-10-02T10:00:00.000Z',
    activatedAt: '2026-10-02T10:00:00.000Z',
    completedAt: '2026-10-04T16:00:00.000Z'
  },
  {
    id: 'proj-7',
    macroGoalId: 'goal-2',
    title: 'Instalación de protocolo de descanso y sueño profundo',
    description: 'Oscurecimiento total del dormitorio y filtro de luz azul tras las 21:00.',
    deadline: '2026-09-30',
    status: 'completed',
    nextActions: [
      { id: 'act-701', text: 'Instalar cortinas blackout y ajustar temperatura nocturna', completed: true, completedAt: '2026-09-30T17:45:00.000Z' }
    ],
    createdAt: '2026-09-25T08:00:00.000Z',
    activatedAt: '2026-09-25T08:00:00.000Z',
    completedAt: '2026-09-30T18:00:00.000Z'
  }
];

class Store {
  constructor() {
    this.listeners = new Set();
    this.data = this.loadState();
  }

  loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.projects) && Array.isArray(parsed.macroGoals)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error loading state from localStorage:', e);
    }
    // Return default seed data
    const initial = {
      version: 1,
      macroGoals: DEFAULT_MACRO_GOALS,
      projects: DEFAULT_PROJECTS
    };
    this.saveState(initial);
    return initial;
  }

  saveState(data = this.data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.saveState();
    this.listeners.forEach((fn) => fn(this.data));
  }

  // --- WIP Validation ---
  getActiveProjects() {
    return this.data.projects.filter((p) => p.status === 'active');
  }

  getFrozenProjects() {
    return this.data.projects.filter((p) => p.status === 'frozen');
  }

  getCompletedProjects() {
    return this.data.projects
      .filter((p) => p.status === 'completed')
      .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
  }

  getMacroGoals() {
    return this.data.macroGoals;
  }

  getGoalById(goalId) {
    return this.data.macroGoals.find((g) => g.id === goalId) || null;
  }

  getProjectById(projectId) {
    return this.data.projects.find((p) => p.id === projectId) || null;
  }

  canActivateProject(excludeProjectId = null) {
    const active = this.data.projects.filter(
      (p) => p.status === 'active' && p.id !== excludeProjectId
    );
    return active.length < 2;
  }

  // --- Project Actions with Strict WIP Check ---
  activateProject(projectId) {
    const project = this.getProjectById(projectId);
    if (!project) return { success: false, error: 'Proyecto no encontrado' };

    if (project.status === 'active') {
      return { success: true };
    }

    if (!this.canActivateProject(projectId)) {
      sounds.playWarning();
      return {
        success: false,
        reason: 'WIP_LIMIT_REACHED',
        error: 'Límite de WIP alcanzado (máximo 2 proyectos activos). Debes completar o pausar uno antes de iniciar otro.'
      };
    }

    project.status = 'active';
    project.activatedAt = new Date().toISOString();
    sounds.playClick();
    this.notify();
    return { success: true };
  }

  freezeProject(projectId) {
    const project = this.getProjectById(projectId);
    if (!project) return { success: false, error: 'Proyecto no encontrado' };

    project.status = 'frozen';
    sounds.playFreeze();
    this.notify();
    return { success: true };
  }

  completeProject(projectId) {
    const project = this.getProjectById(projectId);
    if (!project) return { success: false, error: 'Proyecto no encontrado' };

    project.status = 'completed';
    project.completedAt = new Date().toISOString();
    sounds.playProjectComplete();
    this.notify();
    return { success: true, project };
  }

  // Quick Capture for The Freezer
  addQuickIdea(title, macroGoalId = null) {
    if (!title || !title.trim()) return null;

    const newIdea = {
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      macroGoalId: macroGoalId || null,
      title: title.trim(),
      description: '',
      deadline: '',
      status: 'frozen',
      nextActions: [],
      createdAt: new Date().toISOString(),
      activatedAt: null,
      completedAt: null
    };

    this.data.projects.unshift(newIdea);
    sounds.playFreeze();
    this.notify();
    return newIdea;
  }

  createProject({ title, macroGoalId = null, deadline = '', status = 'frozen', initialAction = '', description = '' }) {
    if (!title || !title.trim()) {
      return { success: false, error: 'El título del proyecto es obligatorio.' };
    }

    if (status === 'active' && !this.canActivateProject()) {
      sounds.playWarning();
      return {
        success: false,
        reason: 'WIP_LIMIT_REACHED',
        error: 'Límite de WIP alcanzado (máximo 2 proyectos activos). Debes completar o pausar uno antes de iniciar otro.'
      };
    }

    const actions = [];
    if (initialAction && initialAction.trim()) {
      actions.push({
        id: 'act-' + Date.now(),
        text: initialAction.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      });
    }

    const newProject = {
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      macroGoalId: macroGoalId || null,
      title: title.trim(),
      description: description.trim(),
      deadline: deadline || '',
      status: status,
      nextActions: actions,
      createdAt: new Date().toISOString(),
      activatedAt: status === 'active' ? new Date().toISOString() : null,
      completedAt: null
    };

    this.data.projects.unshift(newProject);
    sounds.playClick();
    this.notify();
    return { success: true, project: newProject };
  }

  updateProject(projectId, updates) {
    const project = this.getProjectById(projectId);
    if (!project) return { success: false, error: 'Proyecto no encontrado' };

    if (updates.status === 'active' && project.status !== 'active' && !this.canActivateProject(projectId)) {
      sounds.playWarning();
      return {
        success: false,
        reason: 'WIP_LIMIT_REACHED',
        error: 'Límite de WIP alcanzado (máximo 2 proyectos activos). Debes completar o pausar uno antes de iniciar otro.'
      };
    }

    Object.assign(project, updates);
    this.notify();
    return { success: true, project };
  }

  deleteProject(projectId) {
    const idx = this.data.projects.findIndex((p) => p.id === projectId);
    if (idx !== -1) {
      this.data.projects.splice(idx, 1);
      sounds.playClick();
      this.notify();
      return true;
    }
    return false;
  }

  // --- Next Actions Management ---
  getImmediateNextAction(project) {
    if (!project || !Array.isArray(project.nextActions)) return null;
    return project.nextActions.find((a) => !a.completed) || null;
  }

  toggleNextAction(projectId, actionId) {
    const project = this.getProjectById(projectId);
    if (!project) return;

    const action = project.nextActions.find((a) => a.id === actionId);
    if (!action) return;

    action.completed = !action.completed;
    action.completedAt = action.completed ? new Date().toISOString() : null;

    if (action.completed) {
      sounds.playActionComplete();
    } else {
      sounds.playClick();
    }

    this.notify();
    return action;
  }

  addNextAction(projectId, text) {
    if (!text || !text.trim()) return null;
    const project = this.getProjectById(projectId);
    if (!project) return null;

    if (!Array.isArray(project.nextActions)) {
      project.nextActions = [];
    }

    const newAction = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    project.nextActions.push(newAction);
    sounds.playClick();
    this.notify();
    return newAction;
  }

  deleteNextAction(projectId, actionId) {
    const project = this.getProjectById(projectId);
    if (!project) return;
    project.nextActions = project.nextActions.filter((a) => a.id !== actionId);
    this.notify();
  }

  // --- Macro Goals Management ---
  createMacroGoal({ title, quarter = '', description = '', color = '#38bdf8' }) {
    if (!title || !title.trim()) return null;

    const newGoal = {
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: title.trim(),
      quarter: quarter.trim() || 'Trimestre Actual',
      description: description.trim(),
      color: color || '#38bdf8',
      createdAt: new Date().toISOString()
    };

    this.data.macroGoals.push(newGoal);
    sounds.playClick();
    this.notify();
    return newGoal;
  }

  updateMacroGoal(goalId, updates) {
    const goal = this.getGoalById(goalId);
    if (!goal) return null;
    Object.assign(goal, updates);
    this.notify();
    return goal;
  }

  deleteMacroGoal(goalId) {
    // Unlink projects
    this.data.projects.forEach((p) => {
      if (p.macroGoalId === goalId) {
        p.macroGoalId = null;
      }
    });
    this.data.macroGoals = this.data.macroGoals.filter((g) => g.id !== goalId);
    sounds.playClick();
    this.notify();
  }

  // --- Backup & Restore ---
  exportToJson() {
    const exportData = {
      app: 'FOCUS2',
      exportDate: new Date().toISOString(),
      version: 1,
      macroGoals: this.data.macroGoals,
      projects: this.data.projects
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `focus2_backup_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sounds.playClick();
  }

  importFromJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !Array.isArray(parsed.projects) || !Array.isArray(parsed.macroGoals)) {
        throw new Error('El archivo JSON no tiene la estructura requerida (debe contener macroGoals y projects).');
      }

      this.data = {
        version: 1,
        macroGoals: parsed.macroGoals,
        projects: parsed.projects
      };
      this.saveState();
      this.notify();
      sounds.playActionComplete();
      return { success: true, count: parsed.projects.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  resetToDemoData() {
    this.data = {
      version: 1,
      macroGoals: JSON.parse(JSON.stringify(DEFAULT_MACRO_GOALS)),
      projects: JSON.parse(JSON.stringify(DEFAULT_PROJECTS))
    };
    this.saveState();
    this.notify();
    sounds.playClick();
  }
}

export const store = new Store();

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Phase = 'idle' | 'planning' | 'structure' | 'coding' | 'sync';
type Tab = 'init' | 'workflow' | 'database' | 'preview' | 'evolution' | 'billing';

interface WorkflowGraph {
  nodes: Array<{ id: string; label: string; x: number; y: number; type?: string; style?: any }>;
  edges: Array<{ id: string; source: string; target: string; animated?: boolean }>;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  files: any[];
  previewUrl: string | null;
  prompt: string;
}

interface ProjectState {
  isInitializing: boolean;
  
  // Project Management
  projects: Project[];
  activeProjectId: string | null;
  
  // Active Project State (derived or temporary)
  projectName: string | null;
  repoUrl: string | null;
  previewUrl: string | null;
  activePhase: Phase;
  highlightedTab: Tab;
  autoBuildPrompt: string | null;
  workflow: WorkflowGraph;
  generatedSQL: string | null;
  generatedFiles: any[];

  // Aether Architect State (Wizard)
  wizardStep: number;
  wizardStatus: string;
  wizardLogs: string[];
  
  // Actions
  setWizardStep: (step: number) => void;
  setWizardStatus: (status: string) => void;
  addWizardLog: (log: string) => void;
  clearWizardLogs: () => void;
  
  setInitializing: (status: boolean) => void;
  setProjectDetails: (name: string, repoUrl: string) => void;
  setPreviewUrl: (url: string | null) => void;
  setActivePhase: (phase: Phase) => void;
  setHighlightedTab: (tab: Tab) => void;
  setAutoBuildPrompt: (prompt: string | null) => void;
  setWorkflow: (graph: WorkflowGraph) => void;
  setGeneratedSQL: (sql: string | null) => void;
  setGeneratedFiles: (files: any[]) => void;
  
  // Project Actions
  createProject: (name: string, prompt: string) => string;
  updateProjectFiles: (id: string, files: any[]) => void;
  setActiveProject: (id: string) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      isInitializing: false,
      projects: [],
      activeProjectId: null,

      projectName: null,
      repoUrl: null,
      previewUrl: null,
      activePhase: 'idle',
      highlightedTab: 'init',
      autoBuildPrompt: null,
      workflow: { nodes: [], edges: [] },
      generatedSQL: null,
      generatedFiles: [],
      
      // Wizard Init
      wizardStep: 0,
      wizardStatus: "Idle",
      wizardLogs: [],

      setWizardStep: (step) => set({ wizardStep: step }),
      setWizardStatus: (status) => set({ wizardStatus: status }),
      addWizardLog: (log) => set(state => ({ wizardLogs: [...state.wizardLogs, log] })),
      clearWizardLogs: () => set({ wizardLogs: [] }),

      setInitializing: (status) => set({ isInitializing: status }),
      setProjectDetails: (name, repoUrl) => set({ projectName: name, repoUrl: repoUrl }),
      setPreviewUrl: (url) => {
        set({ previewUrl: url });
        // Update active project if exists
        const { activeProjectId, projects } = get();
        if (activeProjectId) {
            const updatedProjects = projects.map(p => 
                p.id === activeProjectId ? { ...p, previewUrl: url, updatedAt: Date.now() } : p
            );
            set({ projects: updatedProjects });
        }
      },
      setActivePhase: (phase) => set({ activePhase: phase }),
      setHighlightedTab: (tab) => set({ highlightedTab: tab }),
      setAutoBuildPrompt: (prompt) => set({ autoBuildPrompt: prompt }),
      setWorkflow: (graph) => set({ workflow: graph }),
      setGeneratedSQL: (sql) => set({ generatedSQL: sql }),
      setGeneratedFiles: (files) => {
        set({ generatedFiles: files });
        // Update active project if exists
        const { activeProjectId, projects } = get();
        if (activeProjectId) {
            const updatedProjects = projects.map(p => 
                p.id === activeProjectId ? { ...p, files: files, updatedAt: Date.now() } : p
            );
            set({ projects: updatedProjects });
        }
      },

      createProject: (name, prompt) => {
        const id = crypto.randomUUID();
        const newProject: Project = {
            id,
            name,
            prompt,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            files: [],
            previewUrl: null
        };
        set(state => ({
            projects: [newProject, ...state.projects],
            activeProjectId: id,
            projectName: name,
            generatedFiles: [],
            previewUrl: null,
            autoBuildPrompt: prompt
        }));
        return id;
      },

      updateProjectFiles: (id, files) => {
        set(state => ({
            projects: state.projects.map(p => p.id === id ? { ...p, files, updatedAt: Date.now() } : p),
            generatedFiles: state.activeProjectId === id ? files : state.generatedFiles
        }));
      },

      setActiveProject: (id) => {
        const project = get().projects.find(p => p.id === id);
        if (project) {
            set({
                activeProjectId: id,
                projectName: project.name,
                generatedFiles: project.files,
                previewUrl: project.previewUrl,
                autoBuildPrompt: project.prompt
            });
        }
      },

      deleteProject: (id) => {
        set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
            // Reset if active was deleted
            generatedFiles: state.activeProjectId === id ? [] : state.generatedFiles,
            previewUrl: state.activeProjectId === id ? null : state.previewUrl,
            projectName: state.activeProjectId === id ? null : state.projectName
        }));
      }
    }),
    {
      name: 'superior-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ 
        projects: state.projects, 
        activeProjectId: state.activeProjectId,
        // Persist Wizard State
        wizardStep: state.wizardStep,
        wizardStatus: state.wizardStatus,
        wizardLogs: state.wizardLogs,
        isInitializing: state.isInitializing,
        projectName: state.projectName,
        autoBuildPrompt: state.autoBuildPrompt
      }),
    }
  )
);

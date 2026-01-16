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
  // Generation State
  isGenerating: boolean;
  generationProgress: number;
  generationStep: string;
  generationErrors: string[];
  
  // Chat State
  messages: Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string; timestamp: number }>;

  // Actions
  setGenerating: (isGenerating: boolean) => void;
  setGenerationStatus: (progress: number, step: string) => void;
  addMessage: (role: 'user' | 'assistant' | 'system', content: string) => void;
  
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

  // Actions
  setInitializing: (status: boolean) => void;
  setProjectDetails: (name: string, repoUrl: string) => void;
  setPreviewUrl: (url: string | null) => void;
  setActivePhase: (phase: Phase) => void;
  setHighlightedTab: (tab: Tab) => void;
  setAutoBuildPrompt: (prompt: string | null) => void;
  setWorkflow: (graph: WorkflowGraph) => void;
  setGeneratedSQL: (sql: string | null) => void;
  setGeneratedFiles: (files: any[]) => void;
  
  // Vision / Visual Update State
  visualUpdatePrompt: string | null;
  setVisualUpdatePrompt: (prompt: string | null) => void;

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
      isGenerating: false,
      generationProgress: 0,
      generationStep: 'Ready',
      generationErrors: [],
      messages: [],
      
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
      visualUpdatePrompt: null,

      setInitializing: (status) => set({ isInitializing: status }),
      setGenerating: (status) => set({ isGenerating: status }),
      setGenerationStatus: (progress, step) => set({ generationProgress: progress, generationStep: step }),
      addMessage: (role, content) => set(state => ({ 
        messages: [...state.messages, { id: Date.now().toString(), role, content, timestamp: Date.now() }] 
      })),

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
        // Ensure files are not empty and have content
        if (!files || files.length === 0) return;
        
        console.log("Store: Updating generated files", files.length);
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
      setVisualUpdatePrompt: (prompt) => set({ visualUpdatePrompt: prompt }),

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
      partialize: (state) => ({ projects: state.projects, activeProjectId: state.activeProjectId }), // Only persist projects and active ID
    }
  )
);

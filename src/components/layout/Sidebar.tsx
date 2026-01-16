'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Folder, 
  Clock, 
  Settings, 
  User, 
  Search 
} from 'lucide-react';
import { useProjectStore } from '@/store/project-store';

export function Sidebar() {
  const { projects, activeProjectId, setActiveProject, createProject } = useProjectStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
      createProject("New Project", "");
  };

  return (
    <aside className="w-full h-full bg-[#050505] border-r border-white/10 flex flex-col font-mono relative overflow-hidden">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none z-0" />
      
      {/* Header */}
      <div className="p-4 border-b border-white/10 relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center relative group">
            <div className="absolute inset-0 bg-cyan-500/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            <svg className="w-5 h-5 text-cyan-400 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight">AETHER_OS</span>
            <span className="text-[10px] text-cyan-500/60 uppercase tracking-widest">v2.0.4.BETA</span>
          </div>
        </div>
        
        {/* New Project Button */}
        <button 
            onClick={handleCreateNew}
            className="w-full h-10 border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 hover:border-cyan-400/50 text-cyan-400 text-sm font-medium transition-all group flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-cyan-400/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
          INITIALIZE_PROJECT
        </button>
      </div>
      
      {/* Projects Section */}
      <div className="flex-1 overflow-hidden flex flex-col relative z-10">
        {/* Search */}
        <div className="p-4">
          <div className="relative group">
            <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH_FILES..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full h-8 pl-9 pr-4 bg-black border border-white/10 focus:border-cyan-500/50 text-xs text-white placeholder:text-white/20 outline-none transition-all font-mono uppercase" 
            />
          </div>
        </div>
        
        {/* Project List */}
        <div className="flex-1 overflow-y-auto px-2">
          <h3 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-3 px-2 flex items-center gap-2">
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            Directory_Listing
          </h3>
          
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/5 mx-2">
              <Folder className="w-8 h-8 mx-auto mb-2 text-white/10" />
              <p className="text-xs text-white/30 font-mono">NO_DATA_FOUND</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredProjects.map((project) => (
                <motion.button 
                  key={project.id} 
                  onClick={() => setActiveProject(project.id)}
                  className={`w-full p-2 pl-3 border-l-2 transition-all text-left group relative ${
                      activeProjectId === project.id 
                      ? 'border-cyan-400 bg-cyan-950/10' 
                      : 'border-transparent hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder className={`w-3 h-3 ${activeProjectId === project.id ? 'text-cyan-400' : 'text-white/20 group-hover:text-white/40'}`} />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-mono truncate ${activeProjectId === project.id ? 'text-cyan-100' : 'text-white/60 group-hover:text-white'}`}>
                        {project.name}
                      </h4>
                    </div>
                    
                    {activeProjectId === project.id && (
                        <div className="w-1.5 h-1.5 bg-cyan-500 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-white/10 bg-black/50 relative z-10">
        <div className="flex items-center justify-between border border-white/5 p-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/5 flex items-center justify-center text-[10px] font-bold text-white border border-white/10">
              JD
            </div>
            <div className="text-left leading-none">
              <p className="text-[10px] font-bold text-white/80">USR: JOHN_DOE</p>
              <p className="text-[9px] text-cyan-500/60 font-mono mt-0.5">ACCESS: LVL_5</p>
            </div>
          </div>
          <Settings className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors" />
        </div>
      </div>
    </aside>
  );
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

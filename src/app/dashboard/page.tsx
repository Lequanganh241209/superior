
"use client";

import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import PreviewPanel from "@/components/preview/PreviewPanel";
import { GenerationFlow } from "@/components/generation/GenerationFlow";
import { ConsoleOverlay } from "@/components/console/ConsoleOverlay";
import { useProjectStore } from "@/store/project-store";

export default function Dashboard() {
  const { isGenerating, generationProgress, generationStep, generatedFiles, activeProjectId } = useProjectStore();
  
  // Show preview if we have an active project (even if empty initially)
  const showPreview = !!activeProjectId;

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-indigo-500/30 relative">
      <GenerationFlow 
        isOpen={isGenerating} 
        progress={generationProgress} 
        currentStep={generationStep} 
        files={generatedFiles.map((f: any) => f.path)}
        onCancel={() => {}} // TODO: Implement cancel
      />

      <ResizablePanelGroup direction="horizontal" className="h-full">
        
        {/* Panel 1: Sidebar (Navigation) */}
        <ResizablePanel defaultSize={15} minSize={15} maxSize={20} className="min-w-[240px] border-r border-white/5">
          <Sidebar />
        </ResizablePanel>
        
        <ResizableHandle className="bg-transparent hover:bg-indigo-500/50 transition-colors w-[1px]" />

        {/* Panel 2: Chat (AI Interaction) */}
        <ResizablePanel defaultSize={showPreview ? 40 : 82} minSize={30} className="transition-all duration-500 ease-in-out">
          <ChatInterface />
        </ResizablePanel>

        {showPreview && (
          <>
            <ResizableHandle className="bg-white/5 hover:bg-indigo-500/50 transition-colors w-[1px]" />

            {/* Panel 3: Preview (Live App) - Smartly Hidden */}
            <ResizablePanel defaultSize={42} minSize={30}>
              <PreviewPanel files={generatedFiles} />
            </ResizablePanel>
          </>
        )}

      </ResizablePanelGroup>
      
      <ConsoleOverlay />
    </div>
  );
}

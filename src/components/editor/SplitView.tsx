"use client";

import React, { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { EditorPanel } from "./EditorPanel";
import { PreviewPanel } from "./PreviewPanel";
import { Button } from "@/components/ui/button";
import { Smartphone, Tablet, Monitor, Wand2, Rocket, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/project-store";
import { toast } from "sonner";

export function SplitView() {
  const { generatedFiles, projectName, setGeneratedFiles, setPreviewUrl } = useProjectStore();
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Magic Edit State
  const [showMagicEdit, setShowMagicEdit] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState("");
  const [isMagicWorking, setIsMagicWorking] = useState(false);

  const handleMagicEdit = async () => {
    if (!magicPrompt.trim()) return;
    setIsMagicWorking(true);
    const toastId = toast.loading("Magic Edit in progress...");

    try {
      const res = await fetch('/api/ai/codegen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt: magicPrompt,
            currentFiles: generatedFiles
        })
      });

      if (!res.ok) throw new Error("Magic Edit failed");
      const data = await res.json();

      if (data.files && Array.isArray(data.files)) {
          const changes = data.files as any[];
          const isPartial = Boolean(data.partial);
          if (isPartial) {
              const existing = generatedFiles || [];
              const merged = (() => {
                  const map = new Map<string, any>();
                  for (const f of existing) { if (f && f.path) map.set(f.path, f); }
                  for (const f of changes) { if (f && f.path) map.set(f.path, f); }
                  return Array.from(map.values());
              })();
              setGeneratedFiles(merged);
          } else {
              setGeneratedFiles(changes);
          }
          toast.success("Magic Edit applied successfully!", { id: toastId });
          setShowMagicEdit(false);
          setMagicPrompt("");
      } else {
          throw new Error("Invalid response format");
      }
    } catch (e) {
      toast.error("Failed to apply edits. Please try again.", { id: toastId });
    } finally {
      setIsMagicWorking(false);
    }
  };

  const handleDeploy = async () => {
    if (!projectName || generatedFiles.length === 0) {
        toast.error("No project to deploy!");
        return;
    }
    setIsDeploying(true);
    const toastId = toast.loading("Deploying to Vercel...");

    try {
        const res = await fetch('/api/deploy/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: projectName,
                files: generatedFiles
            })
        });

        const data = await res.json();
        if (data.success) {
            setPreviewUrl(data.deployUrl);
            toast.success("Deployed Successfully!", { id: toastId });
            window.open(data.deployUrl, '_blank');
        } else {
            throw new Error(data.error || "Deployment failed");
        }
    } catch (e: any) {
        toast.error(`Deployment failed: ${e.message}`, { id: toastId });
    } finally {
        setIsDeploying(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-background relative">
      {/* Magic Edit Overlay */}
      {showMagicEdit && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Wand2 className="w-5 h-5 text-purple-500" /> Magic Edit
                    </h3>
                    <button onClick={() => setShowMagicEdit(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-sm text-muted-foreground">
                    Describe what you want to change (e.g., &quot;Change the hero background to blue&quot;, &quot;Add a pricing section&quot;).
                </p>
                <textarea 
                    value={magicPrompt}
                    onChange={(e) => setMagicPrompt(e.target.value)}
                    className="w-full h-32 bg-background border border-input rounded-md p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    placeholder="Enter your instructions..."
                    disabled={isMagicWorking}
                />
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setShowMagicEdit(false)} disabled={isMagicWorking}>Cancel</Button>
                    <Button 
                        onClick={handleMagicEdit} 
                        disabled={isMagicWorking || !magicPrompt.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                    >
                        {isMagicWorking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {isMagicWorking ? "Applying..." : "Apply Magic"}
                    </Button>
                </div>
            </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
        <div className="flex items-center gap-2">
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Aether Architect
            </span>
        </div>
        
        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setDevice("desktop")}
                className={cn(device === "desktop" && "bg-background shadow-sm")}
            >
                <Monitor className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setDevice("tablet")}
                className={cn(device === "tablet" && "bg-background shadow-sm")}
            >
                <Tablet className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setDevice("mobile")}
                className={cn(device === "mobile" && "bg-background shadow-sm")}
            >
                <Smartphone className="w-4 h-4" />
            </Button>
        </div>

        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-500"
                onClick={() => setShowMagicEdit(true)}
            >
                <Wand2 className="w-4 h-4 text-purple-500" />
                Magic Edit
            </Button>
            <Button 
                size="sm" 
                className="gap-2 bg-black text-white hover:bg-black/90"
                onClick={handleDeploy}
                disabled={isDeploying}
            >
                {isDeploying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                {isDeploying ? "Deploying..." : "Deploy to Vercel"}
            </Button>
        </div>
      </div>

      {/* Main Split View */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={40} minSize={20} maxSize={60}>
            <EditorPanel />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={60}>
            <div className={cn(
                "h-full w-full bg-muted/20 flex items-center justify-center",
                device !== "desktop" && "p-4"
            )}>
                <div 
                    className={cn(
                        "transition-all duration-300 ease-in-out bg-background overflow-hidden",
                        device === "mobile" && "w-[375px] h-[812px] max-h-full border rounded-lg shadow-2xl",
                        device === "tablet" && "w-[768px] h-[1024px] max-h-full border rounded-lg shadow-2xl",
                        device === "desktop" && "w-full h-full border-none rounded-none shadow-none"
                    )}
                >
                    <PreviewPanel />
                </div>
            </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

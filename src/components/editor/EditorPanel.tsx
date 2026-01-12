"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, User, Loader2, Code2, Plus, FolderOpen, Trash2, History, ImagePlus, X } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
    role: "user" | "assistant";
    content: string;
    image?: string;
}

export function EditorPanel() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your Aether Architect. Describe the website you want to build, and I will generate the code for you." }
  ]);
  const [showProjects, setShowProjects] = useState(false);
  
  const { 
      generatedFiles,
      setGeneratedFiles, 
      setPreviewUrl, 
      createProject, 
      activeProjectId, 
      projects, 
      setActiveProject,
      deleteProject,
      projectName
  } = useProjectStore();

  // Restore session on load
  useEffect(() => {
    // If we have an active project but no generated files (e.g. page refresh),
    // the store persistence might handle it, but we can double check logic here if needed.
    // Zustand persist middleware usually handles rehydration automatically.
  }, []);

  const handleCreateProject = () => {
    const id = createProject("New Project", "");
    toast.success("New project created");
    setMessages([{ role: "assistant", content: "New project created. What would you like to build?" }]);
    setShowProjects(false);
  };

  const handleSwitchProject = (id: string) => {
    setActiveProject(id);
    const proj = projects.find(p => p.id === id);
    if (proj) {
        setMessages([
            { role: "assistant", content: `Switched to project: ${proj.name}` },
            ...(proj.files.length > 0 ? [{ role: "assistant" as const, content: "I've loaded your previous files." }] : [])
        ]);
        toast.success(`Switched to ${proj.name}`);
    }
    setShowProjects(false);
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
        deleteProject(id);
        toast.success("Project deleted");
        if (activeProjectId === id) {
            setMessages([{ role: "assistant", content: "Project deleted. Please create a new one or select an existing project." }]);
        }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
            const blob = item.getAsFile();
            if (blob) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setAttachedImage(event.target?.result as string);
                    toast.success("Image attached from clipboard");
                };
                reader.readAsDataURL(blob);
            }
        }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setAttachedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!prompt.trim() && !attachedImage) || loading) return;

    const userMsg = prompt;
    const userImage = attachedImage;
    setMessages(prev => [...prev, { role: "user", content: userMsg, image: userImage || undefined }]);
    setPrompt("");
    setAttachedImage(null);
    setLoading(true);

    // Create project if none exists
    if (!activeProjectId) {
        const name = userMsg.length > 30 ? userMsg.slice(0, 30) + "..." : "New Project";
        createProject(name, userMsg);
    }

    // THINKING PROCESS (To mimic Lovable)
    setMessages(prev => [...prev, { role: "assistant", content: "🔍 Analyzing your request..." }]);
    await new Promise(r => setTimeout(r, 800));
    setMessages(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = { role: "assistant", content: "🎨 Selecting the perfect design system..." };
        return newArr;
    });
    await new Promise(r => setTimeout(r, 1000));
    setMessages(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = { role: "assistant", content: "🏗️ Architecting component structure..." };
        return newArr;
    });

    try {
        const response = await fetch("/api/ai/codegen", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                prompt: userMsg,
                image: userImage, // SEND IMAGE TO API
                plan: "full_website", 
                currentFiles: generatedFiles
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.files && Array.isArray(data.files)) {
            const incoming = data.files as any[];
            const isPartial = Boolean(data.partial);
            if (isPartial) {
                const existing = generatedFiles || [];
                const merged = (() => {
                    const map = new Map<string, any>();
                    for (const f of existing) { if (f && f.path) map.set(f.path, f); }
                    for (const f of incoming) { if (f && f.path) map.set(f.path, f); }
                    return Array.from(map.values());
                })();
                setGeneratedFiles(merged);
            } else {
                setGeneratedFiles(incoming);
            }
            setPreviewUrl("sandpack"); // Enable Preview mode with Sandpack
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: "I've generated the code for your website. The Preview tab is now active." 
            }]);
            toast.success("Code generated successfully!");
        } else {
            throw new Error("Invalid response format from server");
        }
    } catch (error: any) {
        console.error(error);
        const errorMessage = error.message || "Sorry, I encountered an error while generating the code.";
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${errorMessage} (Check console for details)` }]);
        toast.error(`Generation failed: ${errorMessage}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card/30 relative">
        {/* Project Header */}
        <div className="h-12 border-b bg-muted/20 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 font-semibold text-foreground"
                    onClick={() => setShowProjects(!showProjects)}
                >
                    <History className="w-4 h-4" />
                    {projectName || "Select Project"}
                </Button>
            </div>
            <Button variant="outline" size="sm" onClick={handleCreateProject} className="gap-2 h-8">
                <Plus className="w-3.5 h-3.5" />
                New
            </Button>
        </div>

        {/* Project List Dropdown */}
        {showProjects && (
            <div className="absolute top-12 left-4 z-50 w-64 bg-card border rounded-lg shadow-lg p-1 max-h-[300px] overflow-y-auto">
                <div className="text-xs font-semibold text-muted-foreground p-2 uppercase tracking-wider">
                    Recent Projects
                </div>
                {projects.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No projects yet.
                    </div>
                ) : (
                    projects.map(p => (
                        <div 
                            key={p.id}
                            className={cn(
                                "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors group",
                                activeProjectId === p.id && "bg-primary/10"
                            )}
                            onClick={() => handleSwitchProject(p.id)}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm truncate">{p.name}</span>
                            </div>
                            <button 
                                onClick={(e) => handleDeleteProject(e, p.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "assistant" ? "bg-primary/10" : "bg-muted"}`}>
                        {msg.role === "assistant" ? <Sparkles className="w-4 h-4 text-primary" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`flex-1 p-4 rounded-lg max-w-[80%] ${msg.role === "assistant" ? "bg-muted/50 rounded-tl-none" : "bg-primary text-primary-foreground rounded-tr-none"}`}>
                        {msg.image && (
                            <img src={msg.image} alt="User upload" className="max-w-full h-auto rounded-md mb-2 border border-white/20" />
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                </div>
            ))}
            {loading && (
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 bg-muted/50 p-4 rounded-lg rounded-tl-none flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Architecting your solution...</span>
                    </div>
                </div>
            )}
        </div>

        <div className="p-4 border-t bg-background">
            {attachedImage && (
                <div className="relative inline-block mb-2 group">
                    <img src={attachedImage} alt="Attached" className="h-16 w-16 object-cover rounded-md border" />
                    <button 
                        onClick={() => setAttachedImage(null)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
                <Textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="Describe your dream website... (Paste images here)"
                    className="min-h-[100px] pr-20 resize-none shadow-none focus-visible:ring-1"
                />
                <div className="absolute bottom-3 right-3 flex gap-2">
                     <label className="cursor-pointer p-2 hover:bg-muted rounded-md transition-colors">
                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <Button 
                        size="icon" 
                        type="submit" 
                        className="h-8 w-8"
                        disabled={(!prompt.trim() && !attachedImage)}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {["Landing Page", "Portfolio", "SaaS Dashboard", "E-commerce"].map((suggestion) => (
                    <Button 
                        key={suggestion} 
                        variant="outline" 
                        size="xs" 
                        className="text-xs whitespace-nowrap rounded-full"
                        onClick={() => setPrompt(`Create a modern ${suggestion} with...`)}
                    >
                        {suggestion}
                    </Button>
                ))}
            </div>
        </div>
    </div>
  );
}

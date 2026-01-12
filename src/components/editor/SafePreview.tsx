
"use client";

import React, { useEffect, useState } from "react";
import { useSandpackConsole, useSandpack } from "@codesandbox/sandpack-react";
import { useProjectStore } from "@/store/project-store";
import { toast } from "sonner";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SafePreviewProps {
  onFixApplied?: () => void;
}

export function SafePreview({ onFixApplied }: SafePreviewProps) {
  const { logs } = useSandpackConsole({ resetOnPreviewRestart: true });
  const { sandpack } = useSandpack();
  const { generatedFiles, setGeneratedFiles } = useProjectStore();
  
  const [isFixing, setIsFixing] = useState(false);
  const [detectedError, setDetectedError] = useState<string | null>(null);
  const [errorFile, setErrorFile] = useState<string | null>(null);

  // Monitor logs for runtime errors
  useEffect(() => {
    // Filter for error logs
    const errorLogs = logs.filter(log => log.method === "error");
    
    if (errorLogs.length > 0) {
      const lastError = errorLogs[errorLogs.length - 1];
      const message = lastError.data?.map(d => d.toString()).join(" ") || "Unknown Error";
      
      // Filter out non-critical errors or noise
      if (
        message.includes("React DevTools") || 
        message.includes("Download the React DevTools") ||
        message.includes("The above error occurred in the")
      ) {
        return;
      }

      // If we found a new critical error
      if (message !== detectedError) {
        console.log("SafePreview caught error:", message);
        setDetectedError(message);
        
        // Try to guess the file (Sandpack sometimes gives stack trace)
        // Default to active file or try to parse
        setErrorFile(sandpack.activeFile);
      }
    } else {
        // Clear error if logs are cleared (restart)
        if (logs.length === 0 && detectedError) {
            setDetectedError(null);
        }
    }
  }, [logs, detectedError, sandpack.activeFile]);

  const handleAutoFix = async () => {
    if (!detectedError || !errorFile) return;

    setIsFixing(true);
    toast.info("Aether Architect is analyzing the crash...", {
        icon: <Sparkles className="w-4 h-4 text-indigo-400" />
    });

    try {
        // Find the content of the file
        // Sandpack files are keyed by path
        const currentCode = sandpack.files[errorFile]?.code || "";
        
        if (!currentCode) {
            toast.error("Could not read file content.");
            setIsFixing(false);
            return;
        }

        // Call the Fix API
        const response = await fetch("/api/ai/fix", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                errorMessage: detectedError,
                file: errorFile,
                code: currentCode,
                allFiles: generatedFiles
            })
        });

        const data = await response.json();

        if (data.fixedCode) {
            // Apply the fix to Sandpack AND Store
            sandpack.updateFile(errorFile, data.fixedCode);
            
            // Update the global store so changes persist
            const updatedFiles = generatedFiles.map((f: any) => {
                // Handle path matching (store paths might not have leading /)
                const storePath = f.path.startsWith('/') ? f.path : '/' + f.path;
                const targetPath = errorFile.startsWith('/') ? errorFile : '/' + errorFile;
                
                if (storePath === targetPath) {
                    return { ...f, content: data.fixedCode };
                }
                return f;
            });
            setGeneratedFiles(updatedFiles);

            toast.success("Self-Correction Applied!", {
                description: "The system automatically fixed the runtime error.",
                icon: <Sparkles className="w-4 h-4 text-green-400" />
            });
            
            setDetectedError(null);
            if (onFixApplied) onFixApplied();
        } else {
            toast.error("Failed to generate a fix.");
        }

    } catch (e) {
        console.error("Fix failed", e);
        toast.error("Self-Correction system failed.");
    } finally {
        setIsFixing(false);
    }
  };

  if (!detectedError) return null;

  return (
    <div className="absolute bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <div className="bg-destructive/90 text-destructive-foreground p-4 rounded-lg shadow-lg backdrop-blur-sm max-w-md border border-red-500/50">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Runtime Error Detected</h4>
                    <p className="text-xs opacity-90 line-clamp-2 font-mono bg-black/20 p-1 rounded mb-3">
                        {detectedError}
                    </p>
                    <div className="flex gap-2">
                        <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-8 text-xs bg-white/10 hover:bg-white/20 text-white border-none"
                            onClick={() => setDetectedError(null)}
                        >
                            Dismiss
                        </Button>
                        <Button 
                            size="sm" 
                            className="h-8 text-xs bg-white text-red-600 hover:bg-white/90 border-none font-semibold shadow-sm"
                            onClick={handleAutoFix}
                            disabled={isFixing}
                        >
                            {isFixing ? (
                                <>
                                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                                    Fixing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3 h-3 mr-1.5" />
                                    Auto-Fix
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

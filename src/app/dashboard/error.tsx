"use client";

import { useEffect } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Fatal Error:", error);
  }, [error]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white p-6 space-y-6">
      <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-bold text-red-400">System Malfunction Detected</h2>
        <p className="text-sm text-zinc-400">
          The dashboard encountered a critical error. This might be due to a network interruption or a temporary glitch.
        </p>
        <div className="bg-zinc-900/50 p-3 rounded text-xs font-mono text-left overflow-auto max-h-32 border border-white/5">
            {error.message || "Unknown Error"}
        </div>
      </div>
      <Button 
        onClick={() => reset()}
        variant="outline"
        className="gap-2 border-white/10 hover:bg-white/5 text-white"
      >
        <RotateCcw className="w-4 h-4" /> Try Again
      </Button>
    </div>
  );
}

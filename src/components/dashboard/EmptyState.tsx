"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Lazy load ProjectInit to prevent circular dependency and TDZ errors
const ProjectInit = dynamic(
  () => import("./ProjectInit").then((mod) => mod.ProjectInit),
  { 
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-zinc-400 text-sm">Initializing Architect Engine...</p>
      </div>
    )
  }
);

export function EmptyState() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-zinc-950">
        <ProjectInit />
    </div>
  );
}

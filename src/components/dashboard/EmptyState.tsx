"use client";

import { ProjectInit } from "./ProjectInit";

export function EmptyState() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-zinc-950">
        <ProjectInit />
    </div>
  );
}

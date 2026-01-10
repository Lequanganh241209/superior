"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { SplitView } from "@/components/editor/SplitView";
import { useProjectStore } from "@/store/project-store";
import { Plus, Terminal, Sparkles, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSkeleton } from "@/components/dashboard/SkeletonLoader";

interface Project {
  id: string;
  name: string;
  repo_name: string;
  deployment_url: string;
  status: string;
}

// ... existing overrides logic ...
const OVERRIDES: Record<string, string> = {
  writingtask2: "https://writingtask2-646deiwnu-le-quang-tons-projects.vercel.app"
};
const overrideFor = (p: Project) => {
  const key1 = (p.name || "").toLowerCase();
  const tail = (p.repo_name || "").split("/").pop() || "";
  const key2 = tail.toLowerCase();
  return OVERRIDES[key1] || OVERRIDES[key2] || null;
};
const healPreview = async (p: Project) => {
  const ov = overrideFor(p);
  if (ov) return ov;
  if ((p.deployment_url || "").toLowerCase().includes("writingtask2.vercel.app")) {
    return OVERRIDES.writingtask2;
  }
  try {
    const head = await fetch(p.deployment_url, { method: "HEAD" });
    if (head.ok) return p.deployment_url;
    const refetch = await fetch("/api/projects/list");
    if (refetch.ok) {
      const refreshed = await refetch.json();
      const match =
        refreshed.projects?.find((x: any) => x.repo_name === p.repo_name) ||
        refreshed.projects?.[0];
      if (match?.deployment_url) return match.deployment_url;
    }
  } catch {}
  return p.deployment_url;
};

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-zinc-950">
      <div className="relative">
        <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
        <div className="relative w-32 h-32 bg-zinc-900 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl">
            <Terminal className="w-16 h-16 text-purple-500" />
        </div>
      </div>
      
      <div className="max-w-md space-y-4">
        <h2 className="text-3xl font-bold text-white tracking-tight">
            Welcome to Aether Architect
        </h2>
        <p className="text-zinc-400">
            Select an existing project from the sidebar or initialize a new neural architecture to begin.
        </p>
      </div>

      <div className="flex gap-4">
        <Button size="lg" onClick={onCreate} className="h-12 px-8 bg-white text-black hover:bg-zinc-200 rounded-full font-semibold gap-2">
            <Plus className="w-5 h-5" />
            Initialize Project
        </Button>
        <Button size="lg" variant="outline" className="h-12 px-8 border-zinc-800 text-zinc-300 hover:bg-zinc-900 rounded-full gap-2">
            <FolderOpen className="w-5 h-5" />
            Open Existing
        </Button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { projectName, setProjectDetails, setPreviewUrl, createProject } = useProjectStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (!session) {
           if (mounted) router.push("/login");
           return;
        }

        if (mounted) setUser(session.user);
        
        // Background Data Load
        if (mounted) setIsLoading(false); // Render dashboard immediately while fetching projects

        try {
            const res = await fetch('/api/projects/list');
            if (res.ok && mounted) {
                const json = await res.json();
                const list = json.projects || [];
                // Only auto-select if we have projects AND no project is currently selected
                if (list.length > 0 && !projectName) {
                    setProjectDetails(list[0].repo_name, `https://github.com/${list[0].repo_name}`);
                    try {
                        const fixed = await healPreview(list[0]);
                        if (mounted) setPreviewUrl(fixed);
                    } catch {}
                }
            }
        } catch (e) {
            console.error("Failed to load projects", e);
        }
        // finally block removed to avoid double state update
      } catch (error) {
        console.error("Auth check failed", error);
        router.push("/login");
      }
    };

    checkUser();
    return () => { mounted = false; };
  }, [projectName, setProjectDetails, setPreviewUrl, router]);

  if (isLoading) {
      return <DashboardSkeleton />;
  }

  // If no project is active, show Empty State
  if (!projectName) {
      return <EmptyState onCreate={() => createProject("New Project", "")} />;
  }

  // Render the new Split View Editor
  return <SplitView />;
}

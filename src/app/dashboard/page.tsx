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

const healPreview = async (p: Project) => {
  try {
    if (p.deployment_url) {
        const head = await fetch(p.deployment_url, { method: "HEAD" });
        if (head.ok) return p.deployment_url;
    }
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

import { ProjectInit } from "@/components/dashboard/ProjectInit";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { projectName, setProjectDetails, setPreviewUrl, createProject } = useProjectStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // HYDRATION FIX: Restore files from active project if missing
    // This runs on mount to ensure if user refreshes, they don't lose the file view
    const { activeProjectId, projects, generatedFiles, setGeneratedFiles, projectName, setProjectDetails, setPreviewUrl } = useProjectStore.getState();
    
    if (activeProjectId && projects.length > 0 && (!generatedFiles || generatedFiles.length === 0)) {
        const activeProject = projects.find(p => p.id === activeProjectId);
        if (activeProject && activeProject.files && activeProject.files.length > 0) {
            console.log("Hydrating files from persisted project:", activeProject.name);
            setGeneratedFiles(activeProject.files);
            // Also restore preview URL if available
            if (activeProject.previewUrl) {
                setPreviewUrl(activeProject.previewUrl);
            }
        }
    }

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
                // AND we don't have a locally active project
                const localActive = useProjectStore.getState().activeProjectId;
                
                if (list.length > 0 && !projectName && !localActive) {
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
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center space-y-8 bg-zinc-950">
            <ProjectInit />
        </div>
      );
  }

  // Render the new Split View Editor
  return <SplitView />;
}

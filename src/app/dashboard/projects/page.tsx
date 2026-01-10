"use client";
import { useEffect, useState } from "react";
import { useProjectStore } from "@/store/project-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, FolderOpen, Trash2, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ProjectsPage() {
    const { projects, setActiveProject, deleteProject } = useProjectStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(false);
    }, []);

    const handleOpen = (id: string) => {
        setActiveProject(id);
        router.push("/dashboard"); // Go to workspace
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this project?")) {
            deleteProject(id);
            toast.success("Project deleted");
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-8 space-y-6 h-full overflow-y-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Your Projects</h1>
                <Button onClick={() => router.push("/dashboard")} className="gap-2">
                    <Plus className="w-4 h-4" /> New Project
                </Button>
            </div>
            
            {projects.length === 0 ? (
                <div className="text-center text-muted-foreground py-20 border-2 border-dashed rounded-lg">
                    No projects found locally. Create one in the Workspace.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((p) => (
                        <Card key={p.id} className="hover:border-primary/50 transition-colors bg-card/50">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span className="truncate">{p.name}</span>
                                    {p.previewUrl && (
                                        <a href={p.previewUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                </CardTitle>
                                <CardDescription>Last updated: {new Date(p.updatedAt).toLocaleDateString()}</CardDescription>
                            </CardHeader>
                            <CardFooter className="flex justify-between gap-2">
                                <Button variant="outline" onClick={() => handleOpen(p.id)} className="flex-1 gap-2">
                                    <FolderOpen className="w-4 h-4" /> Open
                                </Button>
                                <Button variant="ghost" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive/80 px-2">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

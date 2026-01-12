"use client";

import { useState } from "react";
import { Loader2, Rocket, Upload, CheckCircle2, ExternalLink, Cpu, Terminal, RotateCcw } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase/client";

export function ProjectInit() {
  const { isInitializing, setInitializing, setProjectDetails, setHighlightedTab, setWorkflow, setGeneratedSQL, setPreviewUrl } = useProjectStore();
  const [input, setInput] = useState("");
  const [projectName, setProjectNameInput] = useState("");

  const [deployData, setDeployData] = useState<{ url: string, dashboard: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleReset = () => {
      setInitializing(false);
      setLogs([]);
      toast.info("System State Reset");
  };

  const handleInitialize = async () => {
    if (!input.trim() || !projectName.trim()) return;
    
    const slug = projectName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
    const parse = async (res: Response) => {
        const text = await res.text();
        let data: any = null;
        try { data = JSON.parse(text); } catch { throw new Error(text.slice(0, 200)); }
        if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
        return data;
    };
    
    const ensureRequiredFiles = (files: { path: string; content: string }[]) => {
        const out = [...files];
        const upsert = (filePath: string, content: string) => {
            const idx = out.findIndex(f => f.path === filePath);
            if (idx === -1) out.push({ path: filePath, content });
            else out[idx] = { ...out[idx], content };
        };

        if (!out.find(f => f.path === "package.json")) {
            upsert("package.json", JSON.stringify({
                name: slug || "aether-app",
                version: "1.0.0",
                private: true,
                scripts: { dev: "next dev", build: "next build", start: "next start" },
                dependencies: { 
                    "next": "14.1.0", 
                    "react": "18.2.0", 
                    "react-dom": "18.2.0",
                    "lucide-react": "^0.300.0",
                    "clsx": "^2.1.0",
                    "tailwind-merge": "^2.2.0",
                    "tailwindcss-animate": "^1.0.7",
                    "class-variance-authority": "^0.7.0",
                    "@radix-ui/react-slot": "^1.0.2"
                },
                devDependencies: {
                    "typescript": "^5",
                    "@types/node": "^20",
                    "@types/react": "^18",
                    "@types/react-dom": "^18",
                    "autoprefixer": "^10.0.1",
                    "postcss": "^8",
                    "tailwindcss": "^3.3.0"
                }
            }, null, 2));
        }
        if (!out.find(f => f.path === "next.config.js")) {
            upsert("next.config.js", `
/** Embedded-friendly config */
module.exports = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors *" }
        ],
      },
    ]
  },
}
`.trim());
        }
        if (!out.find(f => f.path === "next-env.d.ts")) {
            upsert("next-env.d.ts", "/// <reference types=\"next\" />\n/// <reference types=\"next/image-types/global\" />");
        }
        upsert("tsconfig.json", JSON.stringify({
            compilerOptions: {
                target: "ES2020",
                lib: ["DOM", "DOM.Iterable", "ESNext"],
                allowJs: true,
                skipLibCheck: true,
                strict: true,
                noEmit: true,
                esModuleInterop: true,
                module: "esnext",
                moduleResolution: "bundler",
                resolveJsonModule: true,
                isolatedModules: true,
                jsx: "preserve",
                incremental: true,
                plugins: [{ name: "next" }],
                baseUrl: ".",
                paths: { "@/*": ["./src/*"] }
            },
            include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            exclude: ["node_modules"]
        }, null, 2));
        if (!out.find(f => f.path === "src/app/layout.tsx")) {
            upsert("src/app/layout.tsx", `
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontHeading = Outfit({ subsets: ["latin"], variable: "--font-heading", weight: ['400', '700'] });
const fontBody = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Superior App",
  description: "Generated by Superior AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        "min-h-screen bg-background font-body antialiased",
        fontHeading.variable,
        fontBody.variable
      )}>
        {children}
      </body>
    </html>
  );
}
`.trim());
        }
        if (!out.find(f => f.path === "src/app/globals.css")) {
            upsert("src/app/globals.css", "html,body{margin:0;padding:0}*,*:before,*:after{box-sizing:border-box}");
        }

        if (!out.find(f => f.path === "src/lib/utils.ts")) {
            upsert("src/lib/utils.ts", `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`);
        }
        if (!out.find(f => f.path === "src/components/ui/button.tsx")) {
            upsert("src/components/ui/button.tsx", `import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
}

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
)
Button.displayName = "Button"
`);
        }
        if (!out.find(f => f.path === "src/components/ui/card.tsx")) {
            upsert("src/components/ui/card.tsx", `import * as React from "react"
import { cn } from "../../lib/utils"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"
`);
        }
        return out;
    };
    
    // 1. Get Session & Provider Token
    const { data: { session } } = await supabase.auth.getSession();
    let providerToken = session?.provider_token;
    if (!providerToken && typeof window !== "undefined") {
        try {
            const pat = window.localStorage.getItem("GITHUB_PAT") || "";
            if (pat && pat.length > 0) {
                providerToken = pat;
                toast.info("Using GitHub PAT from localStorage");
            }
        } catch {}
    }

    if (!providerToken) {
        toast.info("Running in System Mode (Using Server-Side GitHub Token)");
    }

    setInitializing(true);
    setLogs([]);
    addLog("SUPREME ORCHESTRATOR ACTIVATED...");
    const toastId = toast.loading("Supreme Orchestrator Activated...", { duration: Infinity });

    try {
        // 1. PLANNING PHASE
        addLog("PHASE 1: ARCHITECTING SYSTEM STRUCTURE...");
        toast.loading("Phase 1: Architecting System Structure...", { id: toastId });
        
        const planRes = await fetch('/api/ai/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input }),
            credentials: 'include' as RequestCredentials,
            signal: AbortSignal.timeout(60000)
        });
        let plan: any;
        try {
            plan = await parse(planRes);
        } catch (e: any) {
             throw new Error("Plan generation failed. Please check your API keys or try again.");
        }
        
        addLog("Blueprint Generated: SQL Schema & Workflow Nodes Ready.");
        
        // Sync State
        setGeneratedSQL(plan.sql);
        if (plan.nodes && plan.edges) {
            setWorkflow({ nodes: plan.nodes, edges: plan.edges });
        }

        // 2. CODING PHASE
        addLog("PHASE 2: GENERATING FULL-STACK SOURCE CODE...");
        toast.loading("Phase 2: Generating Full-Stack Source Code...", { id: toastId });
        
        // ARTIFICIAL DELAY FOR UX "THOUGHT PROCESS" VISIBILITY
        await new Promise(r => setTimeout(r, 800));
        addLog(">> Analyzing UX Patterns & Design System...");
        await new Promise(r => setTimeout(r, 800));
        addLog(">> Selecting Optimal Component Architecture...");
        await new Promise(r => setTimeout(r, 800));
        addLog(">> Injecting Framer Motion Animations...");
        
        const codeRes = await fetch('/api/ai/codegen', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: input, plan }),
            credentials: 'include' as RequestCredentials,
            signal: AbortSignal.timeout(60000)
        });
        let codeData: any;
        try {
            codeData = await parse(codeRes);
        } catch (e: any) {
            throw new Error("Code generation failed. Please check your API keys or try again.");
        }
        
        const ensuredFiles = ensureRequiredFiles(codeData.files).map((file) => {
            const normalizedPath = (file.path || "").replace(/\\/g, "/");
            const isCodeFile = normalizedPath.endsWith(".ts") || normalizedPath.endsWith(".tsx");
            if (!isCodeFile) return file;
            const parts = normalizedPath.split("/");
            const depth = parts[0] === "src" ? Math.max(parts.length - 2, 0) : 0;
            const relativePrefix = depth > 0 ? "../".repeat(depth) : "./";
            const content = (file.content || "").replace(/(['"])@\//g, `$1${relativePrefix}`);
            return { ...file, content };
        });
        addLog(`Code Generation Complete: ${ensuredFiles.length} files ready.`);

        // 3. DEPLOYMENT PHASE
        addLog(`PHASE 3: PUSHING TO GITHUB (${slug})...`);
        toast.loading(`Phase 3: Pushing to GitHub (${slug})...`, { id: toastId });
        
        const repoRes = await fetch('/api/github/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: slug, 
                description: plan.description,
                files: ensuredFiles,
                accessToken: providerToken
            }),
            credentials: 'include' as RequestCredentials,
            signal: AbortSignal.timeout(60000)
        });
        let repoData: any;
        try {
            repoData = await parse(repoRes);
        } catch (e: any) {
            addLog("GitHub unavailable. Switching to direct Vercel deployment.");
            repoData = { repoId: 0, repoUrl: "", repoName: slug };
        }

        addLog(`Repository Created: ${repoData.repoUrl}`);

        addLog("PHASE 4: TRIGGERING VERCEL DEPLOYMENT...");
        toast.loading("Phase 4: Triggering Vercel Deployment...", { id: toastId });
        
        const deployRes = await fetch('/api/deploy/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: slug,
                repoId: repoData.repoId,
                repoName: repoData.repoName,
                files: ensuredFiles
            }),
            credentials: 'include' as RequestCredentials,
            signal: AbortSignal.timeout(60000)
        });
        const deployData = await parse(deployRes);

        addLog(`Deployment Triggered: ${deployData.deployUrl}`);

        // SUCCESS
        setProjectDetails(repoData.repoName, repoData.repoUrl);
        setPreviewUrl(deployData.deployUrl || `https://${slug}.vercel.app`);
        setDeployData({
          url: deployData.deployUrl || `https://${projectName}.vercel.app`,
          dashboard: deployData.dashboardUrl
        });
        
        // Write metadata file to repo for Projects listing
        try {
            await fetch('/api/github/metadata', {
                method: 'POST',
                body: JSON.stringify({
                    repoName: repoData.repoName,
                    accessToken: providerToken,
                    metadata: {
                        name: slug,
                        repoName: repoData.repoName,
                        repoUrl: repoData.repoUrl,
                        deployUrl: deployData.deployUrl || `https://${slug}.vercel.app`,
                        createdAt: new Date().toISOString()
                    }
                })
            });
        } catch {}
        
        addLog("MISSION ACCOMPLISHED. SYSTEM ONLINE.");
        toast.success("System Successfully Orchestrated & Deployed!", { id: toastId });
        
        // Switch to Preview tab to show results
        setTimeout(() => {
            setHighlightedTab("preview");
        }, 2000);

    } catch (err: any) {
        console.error(err);
        addLog(`CRITICAL ERROR: ${err.message}`);
        toast.error(`Orchestration Failed: ${err.message}`, { id: toastId });
    } finally {
        setInitializing(false);
    }
  };

  if (deployData) {
      return (
        <div className="p-6 border border-green-500/30 rounded-lg bg-green-500/5 backdrop-blur-sm space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 text-green-500">
                <CheckCircle2 className="w-8 h-8" />
                <div>
                    <h2 className="text-xl font-semibold">System Successfully Orchestrated</h2>
                    <p className="text-sm text-green-500/80">Your autonomous infrastructure is live.</p>
                </div>
            </div>
            
            <div className="grid gap-3">
                <div className="p-4 bg-background/50 rounded-md border border-border flex justify-between items-center group hover:border-green-500/50 transition-colors">
                    <div>
                        <div className="text-xs text-muted-foreground uppercase">Live URL</div>
                        <div className="font-mono text-sm text-primary">{deployData.url}</div>
                    </div>
                    <a href={deployData.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-green-500/10 rounded-md transition-colors text-green-500">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
                <div className="p-4 bg-background/50 rounded-md border border-border flex justify-between items-center group hover:border-purple-500/50 transition-colors">
                    <div>
                        <div className="text-xs text-muted-foreground uppercase">Vercel Dashboard</div>
                        <div className="font-mono text-sm text-muted-foreground">{deployData.dashboard}</div>
                    </div>
                    <a href={deployData.dashboard} target="_blank" rel="noreferrer" className="p-2 hover:bg-purple-500/10 rounded-md transition-colors text-purple-500">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>

            <button 
                onClick={() => { setDeployData(null); setInput(""); setProjectNameInput(""); setLogs([]); }}
                className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
                <Rocket className="w-4 h-4" /> Initialize Another System
            </button>
        </div>
      );
  }

  return (
    <div className="space-y-6">
      {/* SUPREME ORCHESTRATOR CONSOLE */}
      <div className="p-1 rounded-xl bg-gradient-to-b from-green-500/20 to-purple-500/20">
        <div className="p-6 rounded-lg bg-black/80 backdrop-blur-xl border border-white/10 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg shadow-lg shadow-green-900/20">
                        <Cpu className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                            Supreme Orchestrator Console
                        </h2>
                        <p className="text-xs text-muted-foreground font-mono">
                            v2.0.0 • Autonomous System Architect • Online
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={handleReset}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-white"
                    title="Emergency Reset"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Inputs */}
            <div className="space-y-5">
                <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> Target Project Name
                    </label>
                    <input 
                        value={projectName}
                        onChange={(e) => setProjectNameInput(e.target.value)}
                        disabled={isInitializing}
                        className="w-full bg-background/50 border border-input rounded-md px-4 py-3 text-sm focus:ring-1 focus:ring-green-500 outline-none font-mono placeholder:text-muted-foreground/30"
                        placeholder="e.g. quantum-exchange-v1"
                    />
                </div>



                <div>
                    <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 flex items-center gap-2">
                        <Rocket className="w-3 h-3" /> Master Directive (Prompt)
                    </label>
                    <div className="relative">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isInitializing}
                            className="w-full h-40 bg-background/50 border border-input rounded-md p-4 text-sm focus:ring-1 focus:ring-green-500 outline-none resize-none font-mono placeholder:text-muted-foreground/30 leading-relaxed"
                            placeholder="// Enter your system requirements here...&#10;> Create a DeFi platform with real-time trading charts&#10;> Include user authentication and wallet integration&#10;> Deploy with dark mode UI by default"
                        />
                        <div className="absolute bottom-3 right-3">
                            <button className="p-2 hover:bg-white/10 rounded-md transition-colors group" title="Upload Context">
                                <Upload className="w-4 h-4 text-muted-foreground group-hover:text-green-400 transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Area */}
            <div className="mt-8 flex gap-3">
                <button 
                    onClick={handleInitialize}
                    disabled={isInitializing || !input.trim() || !projectName.trim()}
                    className={cn(
                        "flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-bold tracking-wide transition-all shadow-lg shadow-green-900/20 hover:shadow-green-500/20 hover:scale-[1.01] active:scale-[0.99]",
                        (isInitializing || !input.trim() || !projectName.trim()) && "opacity-50 cursor-not-allowed shadow-none hover:scale-100"
                    )}
                >
                    {isInitializing ? (
                        <span className="flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" /> 
                            PROCESSING DIRECTIVE...
                        </span>
                    ) : "ACTIVATE SUPREME ORCHESTRATOR"}
                </button>

                {isInitializing && (
                    <button 
                        onClick={() => {
                            setInitializing(false);
                            toast.error("Orchestration Aborted by User");
                            addLog("MANUAL ABORT INITIATED.");
                        }}
                        className="px-6 py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors font-bold text-sm tracking-wide"
                    >
                        ABORT
                    </button>
                )}
            </div>

            {/* Live Logs Terminal */}
            {logs.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-6 p-4 bg-black border border-green-500/20 rounded-lg font-mono text-xs max-h-60 overflow-y-auto shadow-inner custom-scrollbar"
                >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                        <span className="text-green-500/50 uppercase tracking-widest text-[10px] font-bold">System Logs</span>
                        <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/20" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                            <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        {logs.map((log, i) => (
                            <div key={i} className="text-green-400/80 break-words font-light tracking-wide flex gap-2">
                                <span className="text-green-600 opacity-50">➜</span>
                                <span>{log}</span>
                            </div>
                        ))}
                        {isInitializing && (
                            <div className="text-green-500 animate-pulse pl-4">_</div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
      </div>
    </div>
  );
}

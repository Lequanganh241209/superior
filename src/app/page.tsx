"use client";

import { ArrowRight, Sparkles, Zap, Shield, Cpu, Code2, Globe, Database, Terminal, ChevronRight, Activity, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// --- Components ---

function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#050505] selection:bg-cyan-500/30">
      {/* Abstract Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:60px_60px] opacity-[0.05]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#1e1e2e,transparent)]" />
      
      <div className="container relative z-10 px-4 md:px-6 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 border border-green-900/30 bg-green-950/10 px-3 py-1 text-xs font-mono text-green-400 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>SYSTEM_READY_V3.8_COMPONENTS_INJECTED</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
              CONSTRUCT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">THE IMPOSSIBLE</span>
            </h1>

            <p className="text-lg text-zinc-400 max-w-xl font-light border-l-2 border-zinc-800 pl-6">
              An autonomous neural architect that doesn&apos;t just write code—it engineers entire digital ecosystems.
              <span className="block mt-2 text-zinc-500 font-mono text-sm">{"// NO_HUMAN_INTERVENTION_REQUIRED"}</span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/dashboard">
                <Button className="h-14 px-8 bg-white text-black hover:bg-cyan-50 font-bold rounded-none skew-x-[-10deg] transition-all hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                  <span className="skew-x-[10deg] flex items-center">
                    INITIALIZE PROJECT <ArrowRight className="ml-2 w-4 h-4" />
                  </span>
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" className="h-14 px-8 border-zinc-800 text-zinc-300 hover:bg-zinc-900/50 hover:text-white hover:border-cyan-500/50 font-mono rounded-none skew-x-[-10deg]">
                  <span className="skew-x-[10deg]">VIEW_BLUEPRINT</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Isometric Terminal Visual */}
          <div className="relative hidden lg:block">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[100px]" />
            <div className="relative z-10 transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out">
              <div className="bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <div className="text-xs font-mono text-zinc-500">aether_core.tsx</div>
                </div>
                <div className="p-6 font-mono text-sm space-y-4">
                  <div className="flex gap-4 text-zinc-500">
                    <span>01</span>
                    <span className="text-purple-400">import</span> <span className="text-white">{"{ Autonomous }"}</span> <span className="text-purple-400">from</span> <span className="text-green-400">&quot;@aether/mind&quot;</span>;
                  </div>
                  <div className="flex gap-4 text-zinc-500">
                    <span>02</span>
                    <span className="text-blue-400">const</span> <span className="text-yellow-400">App</span> = <span className="text-blue-400">await</span> <span className="text-white">Aether.construct</span>({"{ result: 'Perfect' }"});
                  </div>
                  <div className="flex gap-4 text-zinc-500 opacity-50">
                    <span>03</span>
                    <span>{"// Optimizing neural pathways..."}</span>
                  </div>
                  <div className="flex gap-4 text-zinc-500">
                     <span>04</span>
                     <span className="text-green-400">✓ System Generated in 400ms</span>
                  </div>
                  <div className="mt-8 p-4 bg-zinc-900/50 border-l-2 border-cyan-500 text-cyan-400 text-xs">
                    {">"} DEPLOYMENT_COMPLETE: https://production.aether.os
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description, index }: { icon: any, title: string, description: string, index: string }) {
  return (
    <div className="group relative bg-[#0a0a0a] border border-white/5 hover:border-cyan-500/30 transition-all duration-300 p-8">
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 group-hover:border-cyan-500 transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-700 group-hover:border-cyan-500 transition-colors" />
      
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-zinc-900 group-hover:bg-cyan-950/30 transition-colors">
          <Icon className="w-6 h-6 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
        </div>
        <span className="font-mono text-xs text-zinc-600 group-hover:text-cyan-500/50">[{index}]</span>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-cyan-100 transition-colors">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function Features() {
  const features = [
    { icon: Cpu, title: "Neural Architecture", description: "Unlike simple LLMs, Aether plans entire system topology before writing a single line of code." },
    { icon: Shield, title: "Self-Healing Runtimes", description: "Detected errors are patched in real-time by the overseer agent without downtime." },
    { icon: Globe, title: "Global Edge Deploy", description: "Instant propagation to 300+ edge locations via our proprietary CDN network." },
    { icon: Database, title: "Vector Databases", description: "Built-in embeddings and semantic search capabilities for next-gen AI apps." },
    { icon: Code2, title: "Clean Export", description: "Zero vendor lock-in. Eject to standard Next.js + Supabase stack anytime." },
    { icon: Zap, title: "Hyper-Speed Build", description: "From prompt to production-grade application in under 60 seconds." }
  ];

  return (
    <section id="features" className="py-32 bg-[#050505] border-t border-white/5">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              SYSTEM <span className="text-zinc-600">CAPABILITIES</span>
            </h2>
            <p className="text-zinc-400 max-w-md">
              Engineered for the next generation of software architects.
            </p>
          </div>
          <div className="hidden md:block w-32 h-[1px] bg-gradient-to-r from-transparent to-cyan-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} index={`0${i+1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="py-24 bg-zinc-900/30 border-y border-white/5">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: "LINES_GENERATED", value: "10M+" },
            { label: "ACTIVE_NODES", value: "8,240" },
            { label: "UPTIME", value: "99.99%" },
            { label: "AVG_BUILD_TIME", value: "4.2s" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 font-mono">{stat.value}</div>
              <div className="text-xs text-zinc-500 tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-32 bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black z-0" />
      
      <div className="container relative z-10 px-4 md:px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8 border border-white/10 bg-black/50 backdrop-blur-sm p-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter">
            INITIALIZE SEQUENCE?
          </h2>
          <p className="text-lg text-zinc-400">
            Join the collective of architects building the future.
          </p>
          <div className="flex justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="h-16 px-12 text-lg bg-cyan-600 text-black hover:bg-cyan-500 font-bold rounded-none transition-all">
                EXECUTE LAUNCH <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 bg-black border-t border-white/10 text-sm font-mono">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-zinc-600">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-3 h-3 bg-cyan-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-500" />
            </div>
            <span>AETHER_OS © 2024</span>
          </div>
          <div className="flex space-x-8">
            <span className="hover:text-cyan-500 cursor-pointer transition-colors">PROTOCOL</span>
            <span className="hover:text-cyan-500 cursor-pointer transition-colors">LEGAL</span>
            <span className="hover:text-cyan-500 cursor-pointer transition-colors">STATUS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30">
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center space-x-2 font-bold text-xl tracking-tighter">
            <Activity className="w-5 h-5 text-cyan-500" />
            <span className="tracking-[0.2em]">AETHER</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link href="/login" className="text-xs font-mono text-zinc-400 hover:text-cyan-400 transition-colors hidden sm:block">
              [ ACCESS_TERMINAL ]
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-white text-black hover:bg-zinc-200 rounded-none font-bold text-xs px-6">
                START_ENGINE
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Hero />
        <Stats />
        <Features />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}

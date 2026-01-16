import Link from "next/link";
import { ArrowRight, Terminal, Cpu, Shield, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden">
        {/* Video Background */}
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-0" />

        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-cyan-400 mb-4 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            Aether OS v2.0 Online
          </div>
          
          <h1 className="text-6xl md:text-8xl font-heading font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 text-glow">
            Autonomous <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">App Architect</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Build software at the speed of thought. The first self-healing, autonomous development environment powered by neural architecture.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/dashboard" 
              className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-none hover:bg-cyan-400 transition-all duration-300 clip-path-polygon"
            >
              <div className="absolute inset-0 bg-white group-hover:bg-cyan-400 transition-colors" />
              <span className="relative flex items-center gap-2">
                Initialize System <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link 
              href="https://github.com/tonlq/superior" 
              target="_blank"
              className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold text-lg hover:bg-white/5 transition-all"
            >
              View Source
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-black/50 backdrop-blur-sm border-t border-white/5">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Terminal className="w-8 h-8 text-cyan-400" />}
            title="Natural Language Protocol"
            description="Speak to Aether in plain English. It translates intent into production-grade infrastructure."
          />
          <FeatureCard 
            icon={<Cpu className="w-8 h-8 text-purple-500" />}
            title="Neural Generation"
            description="Advanced AI models architect full-stack solutions, not just code snippets."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-green-400" />}
            title="Self-Healing Core"
            description="The OS detects errors and patches itself in real-time without human intervention."
          />
        </div>
      </section>

      {/* Stats/Terminal Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto cyber-card p-1 rounded-xl overflow-hidden">
          <div className="bg-[#0a0a0a] p-6 rounded-lg font-mono text-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-2 text-white/30">aether_core.exe</span>
            </div>
            <div className="space-y-2">
              <div className="flex gap-4">
                <span className="text-purple-500">➜</span>
                <span className="text-cyan-400">init_sequence</span>
                <span className="text-gray-500">--force</span>
              </div>
              <div className="text-gray-400 pl-6">
                Loading neural modules... <span className="text-green-500">[OK]</span>
              </div>
              <div className="text-gray-400 pl-6">
                Connecting to global grid... <span className="text-green-500">[OK]</span>
              </div>
              <div className="text-gray-400 pl-6">
                System capacity: <span className="text-white">100%</span>
              </div>
              <div className="text-gray-400 pl-6 animate-pulse">
                Ready for user input...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 text-sm border-t border-white/5">
        <p>AETHER OS © 2024 // AUTONOMOUS ARCHITECT</p>
      </footer>
    </div>
  );
}
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
      <div className="mb-4 p-3 bg-black/50 rounded-lg w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-2 font-heading">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

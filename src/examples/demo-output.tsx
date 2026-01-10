import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Zap, Globe, Shield } from "lucide-react";
import { motion } from "framer-motion";

// --- MOCK COMPONENT: HERO SECTION ---
// This demonstrates the "Lovable-Tier" design:
// 1. Large Typography (text-5xl/7xl)
// 2. Subtle Gradient Background
// 3. Glassmorphism Navbar
// 4. Soft Shadows (shadow-xl)
export default function LovableLandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100">
      
      {/* NAVBAR: Sticky + Blur */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">L</div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">LovableUI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">About</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900">Log in</Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-lg shadow-indigo-200">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION: High Impact */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 relative overflow-hidden">
        {/* Abstract Background Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-50/50 rounded-full blur-3xl -z-10" />
        
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
            New Version 2.0 is live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 leading-[1.1]">
            Build websites that feel <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">alive</span>.
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate premium, production-ready landing pages with AI. 
            No more "basic" designs. Just pure, polished excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              Start Building Free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300">
              View Showcase
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURES: Bento Grid Style */}
      <section className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Our AI understands design systems, typography, and spacing better than most juniors.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
              <p className="text-slate-600 leading-relaxed">
                Generate full landing pages in under 30 seconds. Optimized for Next.js 14 and Vercel.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-violet-100 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Enterprise Secure</h3>
              <p className="text-slate-600 leading-relaxed">
                Code that is clean, modular, and type-safe. Ready for SOC2 compliance audits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Global Scale</h3>
              <p className="text-slate-600 leading-relaxed">
                Built-in i18n support and edge caching strategies for worldwide performance.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

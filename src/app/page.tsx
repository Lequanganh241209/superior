"use client";

import React from "react";
import { Hero } from "@/components/english-app/hero";
import { Lessons } from "@/components/english-app/lessons";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0F172A] text-white font-sans selection:bg-indigo-500/30">
      <Hero />
      <Lessons />
      
      {/* Footer Preview */}
      <footer className="py-12 border-t border-white/10 bg-[#0B1120]">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2026 English for Kids. Built with Aether Omniscience.</p>
        </div>
      </footer>
    </main>
  );
}

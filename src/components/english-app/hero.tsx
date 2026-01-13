"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Play, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center bg-[#0F172A]">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0F172A] to-[#0F172A]" />
      
      {/* Floating Elements (Micro-animations) */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 text-yellow-400 opacity-20"
      >
        <Star className="w-24 h-24 fill-current" />
      </motion.div>
      
      <div className="container px-4 md:px-6 relative z-10 mx-auto">
        <div className="flex flex-col items-center text-center space-y-8">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-sm font-medium backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              #1 English Learning Platform for Kids
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-2xl"
          >
            Master English with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-shimmer bg-[length:200%_auto]">
              Super Powers
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-slate-400 max-w-2xl leading-relaxed"
          >
            An immersive, gamified experience where every word learned unlocks a new universe. Join 10,000+ young explorers today.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button size="lg" className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform duration-200">
              <Play className="mr-2 w-5 h-5 fill-current" /> Start Adventure
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl backdrop-blur-md">
              Watch Trailer
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

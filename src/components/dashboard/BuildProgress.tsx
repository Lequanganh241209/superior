"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, Cpu } from 'lucide-react';

const BuildSteps = [
  { id: 1, label: 'Requirement Analysis', duration: 2000 },
  { id: 2, label: 'Dependency Mapping', duration: 1500 },
  { id: 3, label: 'Atomic Implementation', duration: 8000 }, // Longest step (Code Gen)
  { id: 4, label: 'Security & Import Audit', duration: 2000 },
  { id: 5, label: 'VFS Deployment', duration: 1000 }
];

interface BuildProgressProps {
  currentStep: number;
  status: string;
}

export function BuildProgress({ currentStep, status }: BuildProgressProps) {
  return (
    <div className="p-6 bg-[#09090b] border border-zinc-800 rounded-xl shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-purple-500 animate-pulse" />
            <h3 className="text-purple-400 font-bold text-sm tracking-wider">AETHER ARCHITECT ENGINE</h3>
        </div>
        <span className="text-xs text-zinc-400 font-mono flex items-center gap-2">
            {currentStep < 6 ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3 text-green-500" />}
            {status}
        </span>
      </div>
      
      <div className="flex gap-2">
        {BuildSteps.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex-1 space-y-2 group">
              <div className="relative h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: isCompleted ? "100%" : isActive ? "100%" : "0%" }}
                    transition={{ 
                        duration: isCompleted ? 0.5 : step.duration / 1000, 
                        ease: "linear" 
                    }}
                    className={`absolute top-0 left-0 h-full rounded-full ${
                        isCompleted ? 'bg-green-500' : 'bg-purple-500 shadow-[0_0_15px_#a855f7]'
                    }`}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-[10px] font-bold uppercase tracking-tighter transition-colors ${
                    isActive || isCompleted ? 'text-zinc-300' : 'text-zinc-700'
                }`}>
                    {step.label}
                </p>
                {(isActive || isCompleted) && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        {isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                        ) : (
                            <Circle className="w-3 h-3 text-purple-500 fill-purple-500/20 animate-pulse" />
                        )}
                    </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

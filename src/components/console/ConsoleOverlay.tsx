
'use client';

import { useState } from 'react';
import { Terminal, X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ConsoleOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs] = useState([
    { type: 'info', message: 'System initialized', time: '10:00:01' },
    { type: 'success', message: 'Build completed in 2.4s', time: '10:00:05' },
    { type: 'warning', message: 'Unused variable "isActive" in Header.tsx', time: '10:00:06' },
  ]);

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 border backdrop-blur-md ${
          isOpen 
            ? 'bg-zinc-800 text-white border-white/10' 
            : 'bg-black/80 text-zinc-400 hover:text-white border-white/10 hover:border-indigo-500/50'
        }`}
      >
        <Terminal className="w-4 h-4" />
        {isOpen && <span className="text-sm font-medium">Console</span>}
        <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
      </button>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-50 h-80 bg-[#0a0a0a] border-t border-white/10 shadow-2xl"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-white">Terminal Output</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-zinc-500 hover:text-white">Clear</Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0 text-zinc-500 hover:text-white">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Logs */}
                <ScrollArea className="flex-1 p-4 font-mono text-xs">
                  <div className="space-y-2">
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-3 text-zinc-300">
                        <span className="text-zinc-600 shrink-0 select-none">{log.time}</span>
                        <div className="flex items-center gap-2">
                          {log.type === 'error' && <AlertCircle className="w-3 h-3 text-red-500" />}
                          {log.type === 'warning' && <AlertCircle className="w-3 h-3 text-yellow-500" />}
                          {log.type === 'success' && <CheckCircle className="w-3 h-3 text-green-500" />}
                          {log.type === 'info' && <Info className="w-3 h-3 text-blue-500" />}
                          <span>{log.message}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-3 text-zinc-500 animate-pulse">
                      <span className="text-zinc-700 select-none">10:00:07</span>
                      <span>_</span>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

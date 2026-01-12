"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black z-0" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] z-0" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-zinc-900/50 border border-red-500/20 rounded-2xl backdrop-blur-xl relative z-10 shadow-2xl"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/30">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="text-center space-y-3 mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-red-500">Authentication Failed</h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            The neural handshake was interrupted. This usually happens when the authentication code expires or is reused.
          </p>
        </div>

        <div className="space-y-4">
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-4 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="text-xs text-red-200/80">
                    <p className="font-semibold mb-1">Diagnostic Code: AUTH_CODE_INVALID</p>
                    <p>Please try signing in again. If the issue persists, contact support.</p>
                </div>
            </div>

            <Link href="/login" className="block">
                <Button className="w-full h-11 bg-white text-black hover:bg-zinc-200 font-medium">
                    Return to Login <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </Link>
        </div>
      </motion.div>
    </div>
  );
}

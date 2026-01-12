"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function BillingCancel() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-900/10 via-black to-black z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-zinc-900/50 border border-yellow-500/20 rounded-2xl backdrop-blur-xl relative z-10 shadow-2xl text-center"
      >
        <div className="mx-auto w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-yellow-500/30">
          <XCircle className="w-8 h-8 text-yellow-500" />
        </div>

        <h1 className="text-2xl font-bold mb-3">Upgrade Cancelled</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          The payment process was interrupted. No charges have been made to your account.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={() => router.push("/dashboard/billing")} 
            className="w-full h-11 bg-white text-black hover:bg-zinc-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Try Again
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => router.push("/dashboard")} 
            className="w-full h-11 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}


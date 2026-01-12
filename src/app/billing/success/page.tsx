"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function Content() {
  const search = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [plan, setPlan] = useState<string>("pro");

  useEffect(() => {
    const run = async () => {
      const sessionId = search.get("session_id");
      if (!sessionId) return setStatus("failed");
      const res = await fetch(`/api/billing/verify?session_id=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (!res.ok || !data.paid) {
        setStatus("failed");
        return;
      }
      setPlan(data.plan || "pro");
      setStatus("success");

      // Apply subscription securely
      try {
        const applyRes = await fetch('/api/billing/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        });
        if (!applyRes.ok) {
           console.error("Failed to apply subscription");
        }
      } catch (e) {
        console.error("Apply error", e);
      }
    };
    run();
  }, [search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white relative overflow-hidden">
      {status === "success" && (
          <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-green-500/20 to-transparent" />
              <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-green-500/20 to-transparent" />
          </div>
      )}
      
      <div className="w-full max-w-md p-8 bg-zinc-900/50 border border-white/10 rounded-2xl backdrop-blur-xl relative z-10 shadow-2xl text-center">
        {status === "success" && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/50">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">Upgrade Complete</h1>
            <p className="text-zinc-400 mb-8">
                Welcome to the <span className="text-white font-semibold">{plan === "enterprise" ? "Enterprise" : "Pro"}</span> tier. <br/>
                Your neural capabilities have been expanded.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold">
                Enter Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}
        
        {status === "failed" && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/30">
                <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Verification Failed</h1>
            <p className="text-zinc-400 mb-8">We couldn't verify the payment session. Please try again or contact support.</p>
            <Button onClick={() => router.push("/dashboard/billing")} variant="destructive" className="w-full h-11">
                Return to Billing
            </Button>
          </motion.div>
        )}
        
        {status === "verifying" && (
           <div className="py-12 flex flex-col items-center">
             <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
             <p className="text-zinc-400 font-mono text-sm animate-pulse">VERIFYING_TRANSACTION...</p>
           </div>
        )}
      </div>
    </div>
  );
}

export default function BillingSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white"><Loader2 className="w-6 h-6 animate-spin"/></div>}>
      <Content />
    </Suspense>
  );
}

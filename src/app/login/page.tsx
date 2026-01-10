"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Command, ArrowRight, Github, Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and SignUp
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 1. Validation
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast.error((validation.error as any).errors[0].message);
      setIsLoading(false);
      return;
    }

    try {
      // 2. Precheck (Only for Sign Up)
      if (isSignUp) {
        try {
            const pre = await fetch('/api/auth/precheck');
            if (pre.ok) {
            const json = await pre.json();
            if (json.allowed === false) {
                toast.error("Sign-up closed: monthly cap reached (100). Please try next month.");
                setIsLoading(false);
                return;
            }
            }
        } catch {}
      }

      let error;
      
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });
        error = signUpError;
        if (!error) {
            toast.success(
              "Account created! Please check your email to confirm. (Note: On Free Tier, email delivery might be slow. You can use 'Local Mode' to bypass.)",
              { duration: 6000 }
            );
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        error = signInError;
        if (!error) {
            toast.success("Welcome back, Architect.");
            router.push("/dashboard");
        }
      }

      if (error) throw error;

    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('AbortError')) return;
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalMode = () => {
    // Set Local/Demo Mode Cookie and LocalStorage
    document.cookie = "aether_local_mode=true; path=/; max-age=31536000"; // 1 year
    window.localStorage.setItem("aether_use_local_mode", "true");
    
    // Auto-login logic for local mode
    const mockSession = { user: { id: 'dev-user', email: 'architect@aether.os' } };
    window.localStorage.setItem('dev_session', JSON.stringify(mockSession));
    
    toast.success("Switched to Local/Demo Mode. Initializing...");
    
    // Force a hard navigation to Dashboard to ensure all client/server states align
    window.location.href = "/dashboard";
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'repo', // IMPORTANT: Ask for Write access to create repos
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black z-0" />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px] z-0" />

      <div 
        className="w-full max-w-md p-8 space-y-8 bg-zinc-900/50 border border-white/10 rounded-2xl backdrop-blur-2xl relative z-10 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <div 
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Command className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            {isSignUp ? "Initialize Core" : "Welcome Back"}
          </h1>
          <p className="text-sm text-zinc-400">
            {isSignUp ? "Create your neural identity." : "Authenticate to access the Neural Core."}
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 border-none font-semibold text-base relative overflow-hidden group"
          >
            <Github className="w-5 h-5 mr-2" />
            Continue with GitHub
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Button>
          
          <Button
            onClick={handleLocalMode}
            disabled={isLoading}
            variant="ghost"
            className="w-full h-10 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-white/5 transition-all"
          >
            Enter Local / Demo Mode
          </Button>

          <div className="relative">
             <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
             </div>
             <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-900/50 px-2 text-zinc-500 backdrop-blur-sm">Or use email</span>
             </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-zinc-500 tracking-wider">Email Identity</label>
            <div className="relative group">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="architect@aether.os"
                />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase text-zinc-500 tracking-wider">Passphrase</label>
            <div className="relative group">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                placeholder="••••••••"
                />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-base shadow-lg shadow-purple-900/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <span className="flex items-center">
                    {isSignUp ? "Create Identity" : "Authenticate"} <ArrowRight className="ml-2 w-4 h-4" />
                </span>
            )}
          </Button>
        </form>
        
        <div className="text-center space-y-4">
            <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
            >
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
            <div>
                <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                    Return to Landing Page
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}

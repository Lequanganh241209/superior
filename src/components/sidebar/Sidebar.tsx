"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Settings, 
  LogOut, 
  Terminal, 
  CreditCard, 
  HelpCircle,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: LayoutDashboard, label: "Workspace", href: "/dashboard" },
  { icon: FolderOpen, label: "Projects", href: "/dashboard/projects" },
  { icon: CreditCard, label: "Billing", href: "/dashboard/billing" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="w-64 h-screen border-r border-white/5 bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b border-white/5">
        <div className="flex items-center gap-2 font-bold tracking-tight text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <span>Aether OS</span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-zinc-400 hover:text-white hover:bg-white/5",
                pathname === item.href && "bg-white/5 text-white"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 space-y-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-purple-300">System Online</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[70%]" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
                <span>CPU: 12%</span>
                <span>RAM: 3.4GB</span>
            </div>
        </div>

        <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </Button>
      </div>
    </div>
  );
}

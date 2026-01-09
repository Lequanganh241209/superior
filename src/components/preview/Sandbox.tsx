"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ExternalLink, ShieldCheck } from "lucide-react";
import { useProjectStore } from "@/store/project-store";

const OVERRIDES: Record<string, string> = {
  writingtask2: "https://writingtask2-646deiwnu-le-quang-tons-projects.vercel.app"
};

export function Sandbox() {
  const { previewUrl, projectName, setPreviewUrl } = useProjectStore();
  const [frameKey, setFrameKey] = useState(0);
  const active = Boolean(previewUrl);
  const displayUrl = previewUrl || "Waiting for build...";
  const resolveOverride = useCallback((url: string) => {
    if ((url || "").toLowerCase().includes("writingtask2.vercel.app")) return OVERRIDES.writingtask2;
    const tail = (projectName || "").split("/").pop()?.toLowerCase() || "";
    return OVERRIDES[tail] || null;
  }, [projectName]);
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const target = (resolveOverride(previewUrl || "") || previewUrl || "");
  const usingProxy = Boolean(active && blocked);
  const frameSrc = active ? (usingProxy ? `/api/preview/proxy?url=${encodeURIComponent(target)}` : target) : "about:blank";
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!previewUrl) return;
      setChecking(true);
      try {
        const ov = resolveOverride(previewUrl);
        const target = ov || previewUrl;
        const res = await fetch(`/api/preview/check?url=${encodeURIComponent(target)}`);
        if (res.ok) {
          const json = await res.json();
          if (!ignore) setBlocked(Boolean(json.blocked));
        }
      } catch {
        if (!ignore) setBlocked(false);
      } finally {
        if (!ignore) setChecking(false);
      }
    })();
    return () => { ignore = true; };
  }, [previewUrl, projectName, resolveOverride]);
  const healNow = async () => {
    try {
      if (!previewUrl) return;
      const ov = resolveOverride(previewUrl);
      if (ov) {
        setPreviewUrl(ov);
        setFrameKey(k => k + 1);
        setBlocked(false);
        return;
      }
      try {
        const head = await fetch(previewUrl, { method: "HEAD" });
        if (head.ok) {
          setFrameKey(k => k + 1);
          setBlocked(false);
          return;
        }
      } catch {}
      const res = await fetch("/api/projects/list");
      if (res.ok) {
        const json = await res.json();
        const match = json.projects?.find((p: any) => p.repo_name === projectName) || json.projects?.[0];
        if (match?.deployment_url) {
          const ov2 = resolveOverride(match.deployment_url);
          setPreviewUrl(ov2 || match.deployment_url);
          setFrameKey(k => k + 1);
          setBlocked(false);
          return;
        }
      }
    } catch {}
  };

  return (
    <div className="flex flex-col h-[600px] border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="h-10 border-b border-border/50 bg-muted/20 flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <div className="ml-4 px-3 py-0.5 rounded-full bg-background border border-border/50 text-[10px] font-mono text-muted-foreground w-64 truncate">
                    {displayUrl}
                </div>
            </div>
            <div className="flex gap-2">
                <button 
                  className="p-1 hover:text-primary transition-colors"
                  onClick={() => setFrameKey(k => k + 1)}
                  title="Refresh Preview"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                {active && (
                  <button
                    className="p-1 hover:text-primary transition-colors"
                    onClick={healNow}
                    title="Heal Link"
                  >
                    <RefreshCw className="w-3.5 h-3.5 rotate-180" />
                  </button>
                )}
                {active && (
                  <a 
                    className="p-1 hover:text-primary transition-colors"
                    href={previewUrl!}
                    target="_blank"
                    rel="noreferrer"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
            </div>
        </div>
        <div className="flex-1 bg-white relative">
            {!active && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                  <div className="text-center space-y-2">
                      <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-400 rounded-full animate-spin mx-auto" />
                      <p className="font-mono text-sm text-zinc-500">Waiting for build output...</p>
                  </div>
              </div>
            )}
            {active && (blocked || usingProxy) && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400 z-10 bg-white/95">
                <div className="text-center space-y-4 max-w-md px-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-6 h-6 text-yellow-600" />
                  </div>
                  {!usingProxy ? (
                    <div>
                        <h3 className="font-semibold text-zinc-900 mb-1">Bảo Mật Trình Duyệt</h3>
                        <p className="font-mono text-xs text-zinc-600">
                          Trang web này không cho phép hiển thị trong khung (iframe) để bảo mật.
                        </p>
                    </div>
                  ) : (
                    <div>
                        <h3 className="font-semibold text-zinc-900 mb-1">Yêu Cầu Xác Thực Vercel</h3>
                        <p className="font-mono text-xs text-zinc-600">
                          Bạn đang xem link Preview được bảo vệ bởi Vercel. 
                          Hệ thống proxy không thể đăng nhập thay bạn.
                        </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <a 
                      className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      href={previewUrl!}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Mở Website Trong Tab Mới (Khuyên Dùng)
                    </a>
                    <button 
                      className="w-full py-2 px-4 text-xs text-zinc-500 hover:text-zinc-800 underline"
                      onClick={healNow}
                    >
                      Thử tải lại khung xem trước
                    </button>
                  </div>
                  
                  {usingProxy && (
                      <div className="text-[10px] text-zinc-400 bg-zinc-50 p-2 rounded border border-zinc-100 mt-2">
                          Mẹo: Sau khi bạn đăng nhập Vercel ở tab mới, quay lại đây và bấm &quot;Thử tải lại&quot; có thể sẽ xem được.
                      </div>
                  )}
                </div>
              </div>
            )}
            <iframe 
                key={frameKey}
                src={frameSrc}
                className={`w-full h-full transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
                title="Sandbox Preview"
                onError={healNow}
            />
            {usingProxy && (
              <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-zinc-900/70 text-zinc-200 border border-zinc-700">
                Đang hiển thị qua proxy
              </div>
            )}
        </div>
    </div>
  );
}

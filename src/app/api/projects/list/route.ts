import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Octokit } from "@octokit/rest";
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Return empty list instead of 401 to prevent frontend errors
      // The frontend will handle redirect if needed based on session check
      return NextResponse.json({ projects: [] });
    }

    // 1. Try to fetch from DB
    const { data: dbProjects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .neq('deployment_url', '') // Filter out empty deployment URLs
      .not('deployment_url', 'is', null) // Filter out null deployment URLs
      .order('created_at', { ascending: false });
    
    if (error) {
        console.error("DB Fetch Error:", error);
        // Fallback to empty list instead of crashing
        return NextResponse.json({ projects: [] });
    }

    if (dbProjects && dbProjects.length > 0) {
        // Filter out projects that are known to be failed or have invalid URLs
        const validProjects = dbProjects.filter(p => 
            p.deployment_url && 
            p.deployment_url.startsWith('http') && 
            !p.deployment_url.includes('undefined')
        );

        const healed: any[] = [];
        // Limit concurrency to avoid timeout
        for (const p of validProjects.slice(0, 5)) { // Process only top 5 recent projects to reduce load
            let url = p.deployment_url || "";
            let ok = false;
            if (url) {
                try {
                    const res = await fetch(url, { method: "HEAD" });
                    ok = res.ok;
                } catch {}
            }
            if (!ok && process.env.VERCEL_ACCESS_TOKEN) {
                try {
                    const projName = (p.name || "").toLowerCase().replace(/\s+/g, "-");
                    // Query Vercel directly for latest deployment
                    const projRes = await fetch(`https://api.vercel.com/v9/projects/${projName}`, {
                        headers: { Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}` }
                    });
                    if (projRes.ok) {
                        const proj = await projRes.json().catch(() => null);
                        if (proj && proj.id) {
                            const depRes = await fetch(`https://api.vercel.com/v13/deployments?projectId=${proj.id}&limit=1`, {
                                headers: { Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}` }
                            });
                            if (depRes.ok) {
                                const dep = await depRes.json().catch(() => null);
                                const first = dep?.deployments?.[0];
                                const resolved = first?.url ? `https://${first.url}` : (first?.alias?.[0] ? `https://${first.alias[0]}` : "");
                                if (resolved) {
                                    // Try to bind canonical alias <project>.vercel.app to latest deployment (best-effort)
                                    try {
                                        const deploymentId = first?.uid || first?.id;
                                        if (deploymentId) {
                                            await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}/aliases`, {
                                                method: "POST",
                                                headers: { 
                                                    Authorization: `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
                                                    "Content-Type": "application/json"
                                                },
                                                body: JSON.stringify({ alias: `${proj.name}.vercel.app` })
                                            }).catch(() => {});
                                        }
                                    } catch {}
                                    url = resolved;
                                    await supabase.from('projects')
                                        .update({ deployment_url: url })
                                        .eq('id', p.id)
                                        .catch(() => {});
                                }
                            }
                        }
                    }
                } catch (vercelError) {
                    console.error("Vercel Sync Error:", vercelError);
                    // Ignore Vercel errors to prevent API crash
                }
            }
            healed.push({
                id: p.id,
                name: p.name,
                repo_name: p.repo_name,
                deployment_url: url,
                status: p.status || "active",
                created_at: p.created_at
            });
        }
        return NextResponse.json({ projects: healed });
    }

    // 2. If DB is empty, try to Sync from GitHub (Auto-Migration for Admin/Existing User)
    // Only do this if GITHUB_PAT is available (Admin/Owner context)
    if (process.env.GITHUB_PAT && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log("DB empty, attempting auto-sync from GitHub...");
        try {
            const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
            const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
                per_page: 50,
                sort: "updated",
            });

            const syncedProjects = [];
            const adminSupabase = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL, 
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            for (const repo of repos) {
                try {
                    // Check for .aether/project.json metadata
                    const { data: file } = await octokit.rest.repos.getContent({
                        owner: repo.owner.login,
                        repo: repo.name,
                        path: ".aether/project.json",
                    });

                    // @ts-ignore
                    const b64 = file.content || "";
                    const jsonStr = Buffer.from(b64, "base64").toString("utf-8");
                    const meta = JSON.parse(jsonStr);

                    // Found a valid project, insert into DB
                    const newProject = {
                        user_id: user.id,
                        name: meta.name || repo.name,
                        repo_name: `${repo.owner.login}/${repo.name}`,
                        deployment_url: meta.deployUrl || `https://${repo.name}.vercel.app`,
                        status: "active",
                        created_at: repo.created_at || new Date().toISOString()
                    };

                    const { data: inserted, error: insertError } = await adminSupabase
                        .from('projects')
                        .insert(newProject)
                        .select()
                        .single();

                    if (!insertError && inserted) {
                        syncedProjects.push(inserted);
                    }
                } catch (e) {
                    // Not an Aether project, skip
                }
            }

            if (syncedProjects.length > 0) {
                 return NextResponse.json({ 
                    projects: syncedProjects.map(p => ({
                        id: p.id,
                        name: p.name,
                        repo_name: p.repo_name,
                        deployment_url: p.deployment_url || "",
                        status: p.status || "active",
                        created_at: p.created_at
                    }))
                });
            }
        } catch (syncError) {
            console.error("Auto-sync failed:", syncError);
        }
    }

    // If all else fails or truly empty
    return NextResponse.json({ projects: [] });

  } catch (error: any) {
    console.error("Projects List Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { pushFilesToRepo } from "@/lib/github/service";
import { generateRepairChanges } from "@/lib/evolution/repair";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { repoName, accessToken } = body; // repoName: "owner/repo"

    if (!repoName) {
      return NextResponse.json({ error: "Missing repoName" }, { status: 400 });
    }

    const [owner, repo] = repoName.split("/");

    // 1. Generate Fixes
    const changes = await generateRepairChanges(owner, repo, accessToken);

    if (changes.length === 0) {
      return NextResponse.json({ success: true, message: "No repairs needed. Project is healthy." });
    }

    // 2. Push Changes Directly to Main (Force Fix)
    const pushResult = await pushFilesToRepo(
      owner,
      repo,
      "Hotfix: Repair Build Paths & Missing Components (Auto-healed)",
      changes,
      accessToken
    );

    if (!pushResult.success) {
      return NextResponse.json({ error: pushResult.error }, { status: 500 });
    }

    return NextResponse.json({ 
        success: true, 
        message: `Repaired ${changes.length} files. Vercel build should trigger automatically.`,
        details: changes.map(c => c.path)
    });

  } catch (error: any) {
    console.error("Repair API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

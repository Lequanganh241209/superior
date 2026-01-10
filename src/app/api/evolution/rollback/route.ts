import { NextResponse } from "next/server";
import { revertCommit } from "@/lib/github/service";

export async function POST(req: Request) {
  try {
    const { repoName, sha } = await req.json();

    if (!repoName || !sha) {
        return NextResponse.json({ error: "Missing repoName or sha" }, { status: 400 });
    }

    const [owner, repo] = repoName.split('/');
    if (!owner || !repo) {
        return NextResponse.json({ error: "Invalid repo name format" }, { status: 400 });
    }

    const result = await revertCommit(owner, repo, sha);

    if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, sha: result.sha });

  } catch (error: any) {
    console.error("Rollback API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

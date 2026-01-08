import { NextRequest, NextResponse } from "next/server";
/**
 * Rebind canonical alias <project>.vercel.app to latest deployment
 * and return a working URL (hashed alias) as fallback.
 */
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { projectName } = await req.json();
    const token = process.env.VERCEL_ACCESS_TOKEN;
    if (!projectName || !token) {
      return NextResponse.json(
        { error: "Missing projectName or VERCEL_ACCESS_TOKEN" },
        { status: 400 }
      );
    }

    const projRes = await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!projRes.ok) {
      const err = await projRes.text();
      return NextResponse.json({ error: `Project lookup failed: ${err}` }, { status: 404 });
    }
    const proj = await projRes.json();

    const depRes = await fetch(`https://api.vercel.com/v13/deployments?projectId=${proj.id}&limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!depRes.ok) {
      const err = await depRes.text();
      return NextResponse.json({ error: `Deployment list failed: ${err}` }, { status: 500 });
    }
    const dep = await depRes.json();
    const first = dep.deployments?.[0];
    if (!first) {
      return NextResponse.json({ error: "No deployments found" }, { status: 404 });
    }

    const workingUrl =
      first.url ? `https://${first.url}` : first.alias?.[0] ? `https://${first.alias[0]}` : "";

    let aliasBound = false;
    try {
      const deploymentId = first.uid || first.id;
      if (deploymentId) {
        const aliasRes = await fetch(`https://api.vercel.com/v13/deployments/${deploymentId}/aliases`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ alias: `${projectName}.vercel.app` }),
        });
        aliasBound = aliasRes.ok;
      }
    } catch {
      aliasBound = false;
    }

    return NextResponse.json({
      success: true,
      projectId: proj.id,
      projectName: proj.name,
      canonicalAlias: `${projectName}.vercel.app`,
      aliasBound,
      workingUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

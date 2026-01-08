import { NextRequest, NextResponse } from "next/server";
import { setProjectEnv, bindCanonicalAlias, disableDeploymentProtection } from "@/lib/vercel/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawName = (body.name || "").toString();
    const name = rawName.toLowerCase().replace(/\s+/g, "-");
    const accessToken = body.accessToken || undefined;
    if (!name) {
      return NextResponse.json({ error: "Missing project name" }, { status: 400 });
    }

    const providedEnvs = (body.envs || {}) as Record<string, string>;
    const envs: Record<string, string> = {
      NEXT_PUBLIC_SUPABASE_URL: providedEnvs.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: providedEnvs.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      SUPABASE_SERVICE_ROLE_KEY: providedEnvs.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      OPENAI_API_KEY: providedEnvs.OPENAI_API_KEY || process.env.OPENAI_API_KEY || ""
    };

    try {
      await setProjectEnv(name, envs, accessToken);
    } catch {}

    try {
      await disableDeploymentProtection(name, accessToken);
    } catch {}

    await bindCanonicalAlias(name, accessToken);

    return NextResponse.json({
      success: true,
      url: `https://${name}.vercel.app`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}

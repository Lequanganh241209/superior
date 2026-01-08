import { NextRequest, NextResponse } from "next/server";
import { createDeployment } from "@/lib/vercel/service";
import { ContextOracle } from "@/lib/oracle/service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, repoId, repoName, files } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const deployResult = await createDeployment({
      name: name.toLowerCase().replace(/\s+/g, "-"),
      repoId,
      repoName,
      files // Pass files if available
    });

    if (!deployResult.success) {
      return NextResponse.json(
        { error: deployResult.error },
        { status: 500 }
      );
    }

    // V2 Upgrade: Save Metadata to Context Oracle
    // In a real scenario, we would parse the actual project structure here.
    // For now, we initialize with a default template structure.
    try {
        await ContextOracle.saveMetadata({
            project_id: deployResult.projectId || (repoId ? repoId.toString() : name.toLowerCase().replace(/\s+/g, "-")),
            name: name,
            structure: { 
                "src": ["app", "components", "lib"],
                "public": ["assets"]
            },
            dependencies: ["next", "react", "tailwindcss", "framer-motion"],
            env_vars: { "NEXT_PUBLIC_API_URL": "Pending" }
        });
    } catch (oracleError) {
        console.warn("Oracle Metadata Save Failed (Non-critical):", oracleError);
        // Continue execution, do not fail deployment
    }

    return NextResponse.json({
      success: true,
      deployUrl: (deployResult as any).deployUrl,
      dashboardUrl: (deployResult as any).dashboardUrl,
      projectId: (deployResult as any).projectId,
      projectName: (deployResult as any).projectName
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

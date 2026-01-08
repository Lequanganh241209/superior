const VERCEL_API_URL = "https://api.vercel.com";

export interface DeployParams {
  name: string;
  repoId?: number; // Optional now
  repoName?: string; // Optional now
  type?: string;
  files?: { path: string; content: string }[]; // New: Direct files
}

export async function createDeployment({ name, repoId, repoName, type = "github", files }: DeployParams) {
  try {
    const token = process.env.VERCEL_ACCESS_TOKEN;
    if (!token) throw new Error("VERCEL_ACCESS_TOKEN is missing");

    // Strategy: 
    // If 'files' are provided, use Direct Upload (Robust).
    // If 'files' missing, try Git Linking (Fragile, requires integration).

    if (files && files.length > 0) {
        return await deployWithFiles(name, files, token);
    }

    // Fallback: Git Linking (Original Logic)
    if (!repoName || !repoId) throw new Error("Missing repo info for git deployment");

    const response = await fetch(`${VERCEL_API_URL}/v9/projects`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        framework: "nextjs",
        gitRepository: {
          type: type,
          repo: repoName,
          repoId: repoId
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
        if (data.code === 'conflicting_project_path') {
             // If project exists, we can't easily "link" it if it wasn't linked before.
             // But we can return the existing project info as a fallback?
             // Or throw error.
             throw new Error(`Project ${name} already exists. Please choose a different name.`);
        }
        throw new Error(data.error?.message || "Failed to create Vercel project");
    }

    return {
      success: true,
      projectId: data.id,
      projectName: data.name,
      deployUrl: `https://${data.name}.vercel.app`,
      dashboardUrl: `https://vercel.com/${data.accountId}/${data.name}`
    };

  } catch (error: any) {
    console.error("Vercel Deployment Failed:", error);
    return { success: false, error: error.message };
  }
}

async function deployWithFiles(projectName: string, files: { path: string; content: string }[], token: string) {
    try {
        // 1. Ensure Project Exists (Optional, but good for settings)
        // We try to create it without git repo. If it exists, we ignore error.
        await fetch(`${VERCEL_API_URL}/v9/projects`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: projectName,
                framework: "nextjs"
            }),
        });

        // 2. Prepare Files for Vercel API
        // Vercel expects: { file: "path/to/file", data: "content" }
        // Note: content in 'data' is text. For binary, we need encoding? 
        // Our 'files' are text (source code).
        const vercelFiles = files.map(f => ({
            file: f.path.startsWith('/') ? f.path.substring(1) : f.path, // Remove leading slash
            data: f.content
        }));

        // 3. Create Deployment
        const deployRes = await fetch(`${VERCEL_API_URL}/v13/deployments`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: projectName,
                files: vercelFiles,
                projectSettings: {
                    framework: "nextjs"
                },
                target: "production" // Deploy straight to prod URL
            }),
        });

        const deployData = await deployRes.json();

        if (!deployRes.ok) {
            throw new Error(deployData.error?.message || "Failed to upload deployment");
        }

        // 4. Ensure canonical alias <projectName>.vercel.app points to latest deployment
        try {
            const deploymentId = deployData.id || deployData.deploymentId;
            if (deploymentId) {
                const aliasRes = await fetch(`${VERCEL_API_URL}/v13/deployments/${deploymentId}/aliases`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        alias: `${projectName}.vercel.app`
                    })
                });
                // If alias succeeded, prefer the canonical domain
                if (aliasRes.ok) {
                    // no need to read body; alias is set
                }
            }
        } catch (e) {
            // Non-critical: alias setup may fail if domain already points or permissions differ
        }

        return {
            success: true,
            projectId: deployData.projectId,
            projectName: deployData.name,
            deployUrl: deployData.url ? `https://${deployData.url}` : `https://${deployData.alias?.[0]}`,
            dashboardUrl: `https://vercel.com${deployData.inspectorUrl || ''}`
        };

    } catch (error: any) {
         console.error("Direct Deployment Failed:", error);
         return { success: false, error: error.message };
    }
}

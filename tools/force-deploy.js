const fs = require('fs');
const path = require('path');

// Load .env.local manually
let env = {};
try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        });
    }
} catch (e) {
    console.error("Error reading .env.local", e);
}

const token = env.VERCEL_OIDC_TOKEN || env.VERCEL_ACCESS_TOKEN || process.env.VERCEL_ACCESS_TOKEN;
const projectId = "prj_5yRe4Uq6lLWoo5Rl78XzcY2AVX0y"; 

if (!token) {
    console.error("❌ No VERCEL_ACCESS_TOKEN found. Cannot deploy.");
    process.exit(1);
}

async function deploy() {
    try {
        console.log("🚀 Triggering NEW Vercel Deployment...");
        
        // 1. Get Project Details
        const projectRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!projectRes.ok) throw new Error(`Failed to get project: ${projectRes.statusText}`);
        const project = await projectRes.json();
        
        console.log(`✅ Project: ${project.name}`);

        // 2. Trigger Deploy
        const body = {
            name: project.name,
            project: projectId,
            target: "production",
            gitSource: {
                type: "github",
                repoId: "740736f43d0d", // This might be dynamic, but let's try to let Vercel infer or use the project link
                ref: "main"
            }
        };

        // If project is linked, Vercel knows the repoId. We just say "deploy main".
        if (project.link) {
            body.gitSource = {
                type: project.link.type,
                repoId: project.link.repoId,
                ref: "main"
            };
        }

        const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!deployRes.ok) {
             const errText = await deployRes.text();
             throw new Error(`Deployment failed: ${errText}`);
        }

        const deployData = await deployRes.json();
        console.log("\n✅ DEPLOYMENT STARTED SUCCESSFULLY!");
        console.log(`🔗 URL: ${deployData.url}`); // This is the deployment URL
        console.log(`👀 Inspector: ${deployData.inspectorUrl}`);
        console.log(`\nPlease wait for Vercel to finish building. Check the link above.`);

    } catch (e) {
        console.error("❌ Error:", e.message);
    }
}

deploy();

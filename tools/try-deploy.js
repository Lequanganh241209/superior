const fs = require('fs');
const path = require('path');

// Add node_modules_hidden to module search paths
module.paths.push(path.join(process.cwd(), 'node_modules_hidden'));

const axios = require('axios');
const dotenv = require('dotenv');

// Load .env.local
dotenv.config({ path: '.env.local' });

const token = process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL_ACCESS_TOKEN;
const projectId = "prj_5yRe4Uq6lLWoo5Rl78XzcY2AVX0y"; // From .vercel/project.json

if (!token) {
    console.error("No token found in .env.local");
    process.exit(1);
}

console.log(`Using token: ${token.substring(0, 10)}...`);
console.log(`Target Project: ${projectId}`);

async function deploy() {
    try {
        // 1. Get Project to check name and link
        console.log("Fetching project details...");
        const projectRes = await axios.get(`https://api.vercel.com/v9/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const project = projectRes.data;
        console.log(`Project Name: ${project.name}`);
        console.log(`Linked Repo:`, project.link);

        // 2. Trigger Deploy
        console.log("Triggering deployment...");
        
        const body = {
            name: project.name,
            project: projectId,
            target: "production"
        };

        if (project.link) {
            body.gitSource = {
                type: project.link.type,
                repoId: project.link.repoId,
                ref: "main"
            };
        } else {
             console.log("Warning: Project is NOT linked to a git repo. Triggering without gitSource (might fail or do existing build).");
        }

        const deployRes = await axios.post('https://api.vercel.com/v13/deployments', body, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("Deployment triggered successfully!");
        console.log("URL:", deployRes.data.url);
        console.log("Inspector:", deployRes.data.inspectorUrl);
        
    } catch (error) {
        console.error("Error details:", error.response?.data || error.message);
    }
}

deploy();

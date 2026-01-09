
import axios from 'axios';
import * as dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';
dotenv.config({ path: '.env.local' });

const VERCEL_TOKEN = process.env.VERCEL_ACCESS_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN || process.env.GITHUB_PAT;
const PROJECT_NAME = "superior";
const OWNER = "Lequanganh241209";
const REPO = "superior";

async function triggerDeploy() {
    if (!VERCEL_TOKEN) {
        console.error("Missing VERCEL_ACCESS_TOKEN");
        return;
    }
    if (!GITHUB_TOKEN) {
        console.error("Missing GITHUB_TOKEN");
        return;
    }

    try {
        console.log(`Fetching Repo ID for ${OWNER}/${REPO}...`);
        const octokit = new Octokit({ auth: GITHUB_TOKEN });
        const { data: repoData } = await octokit.repos.get({ owner: OWNER, repo: REPO });
        const repoId = repoData.id;
        console.log(`Repo ID: ${repoId}`);

        console.log(`Triggering deployment for ${PROJECT_NAME}...`);
        
        // 1. Get Project ID (to ensure it exists and get ID)
        const projRes = await axios.get(`https://api.vercel.com/v9/projects/${PROJECT_NAME}`, {
            headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
        });
        
        const projectId = projRes.data.id;
        console.log(`Project ID: ${projectId}`);

        // 2. Trigger Deployment via API
        const res = await axios.post('https://api.vercel.com/v13/deployments', {
            name: PROJECT_NAME,
            gitSource: {
                type: "github",
                repoId: repoId, // Use numeric ID
                ref: "main"
            },
            projectSettings: {
                framework: "nextjs"
            },
            target: "production"
        }, {
            headers: { Authorization: `Bearer ${VERCEL_TOKEN}` }
        });

        console.log("Deployment Triggered Successfully!");
        console.log("Deployment ID:", res.data.id);
        console.log("Inspector URL:", res.data.inspectorUrl);
        console.log("State:", res.data.readyState);

    } catch (error: any) {
        console.error("Error triggering deployment:", error.response?.data || error.message);
    }
}

triggerDeploy();

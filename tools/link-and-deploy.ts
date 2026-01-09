import axios from 'axios';
import * as dotenv from 'dotenv';
import { Octokit } from "@octokit/rest";

dotenv.config({ path: '.env.local' });
dotenv.config();

const vercelToken = process.env.VERCEL_ACCESS_TOKEN;
const githubToken = process.env.GITHUB_PAT;

// Project IDs
const projects = [
    { name: "taylorswift", vercelId: "prj_ATfejMDqrLF5ntU0LBfm31RdaPoe", repo: "Lequanganh241209/taylorswift" },
    { name: "superior-roan", vercelId: "prj_s4pAKgWphmcFSlUpP0Yd8cTBdl0i", repo: "Lequanganh241209/superior-roan" }
];

async function linkAndDeploy(project: any) {
    try {
        console.log(`\nProcessing ${project.name}...`);

        // 1. Get GitHub Repo ID
        console.log(`Getting GitHub Repo ID for ${project.repo}...`);
        const octokit = new Octokit({ auth: githubToken });
        const [owner, repoName] = project.repo.split('/');
        const { data: repoData } = await octokit.rest.repos.get({
            owner,
            repo: repoName
        });
        const repoId = repoData.id;
        console.log(`GitHub Repo ID: ${repoId}`);

        // 2. Link to Vercel Project
        console.log(`Linking to Vercel Project ${project.vercelId}...`);
        try {
            await axios.post(
                `https://api.vercel.com/v9/projects/${project.vercelId}/link`,
                {
                    type: "github",
                    repo: project.repo // Fix: Use repo name string
                },
                {
                    headers: { Authorization: `Bearer ${vercelToken}` }
                }
            );
            console.log("✅ Project Linked Successfully!");
        } catch (e: any) {
            if (e.response?.data?.error?.code === 'project_already_linked') {
                console.log("⚠️ Project already linked.");
            } else {
                console.error("Link Error:", e.response?.data || e.message);
            }
        }

        // 3. Trigger Deployment
        console.log("Triggering Deployment...");
        const res = await axios.post('https://api.vercel.com/v13/deployments', {
            name: project.name,
            gitSource: {
                type: "github",
                repoId: repoId.toString(),
                ref: "main"
            },
            target: "production"
        }, {
            headers: { Authorization: `Bearer ${vercelToken}` }
        });

        console.log(`✅ Deployment Triggered! ID: ${res.data.id}`);
        console.log(`Inspector: ${res.data.inspectorUrl}`);

    } catch (error: any) {
        console.error("Error:", error.response?.data || error.message);
    }
}

// Run for all projects
(async () => {
    for (const p of projects) {
        await linkAndDeploy(p);
    }
})();

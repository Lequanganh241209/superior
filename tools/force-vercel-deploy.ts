import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const token = process.env.VERCEL_ACCESS_TOKEN;
const projectId = process.argv[2] || "prj_ATfejMDqrLF5ntU0LBfm31RdaPoe"; // Default to taylorswift if not provided

async function redeploy() {
  try {
    console.log(`Triggering redeploy for project ${projectId}...`);
    
    // 1. Get Project Details to find linked repo
    const { data: project } = await axios.get(`https://api.vercel.com/v9/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!project.link) {
        console.error("Project is not linked to a git repository.");
        return;
    }

    console.log("Linked Repo:", project.link);

    // 2. Trigger new deployment from Git
    const res = await axios.post('https://api.vercel.com/v13/deployments', {
        name: project.name,
        gitSource: {
            type: project.link.type,
            repoId: project.link.repoId,
            ref: "main", // Assuming main branch
            // sha: latestCommitSha // Optional, if we want to be specific
        },
        target: "production"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("\n✅ New Deployment Triggered from Git!");
    console.log(`Deployment ID: ${res.data.id}`);
    console.log(`State: ${res.data.readyState}`);
    console.log(`Inspector URL: ${res.data.inspectorUrl}`);

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

redeploy();
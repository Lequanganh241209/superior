import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const token = process.env.VERCEL_ACCESS_TOKEN;
const projectId = "prj_ATfejMDqrLF5ntU0LBfm31RdaPoe";
const repoId = "1130228767";
const commitSha = "fa8d6e8fb1e6ddc06a003259d55ef35f493803ff";

async function triggerDeploy() {
  try {
    console.log(`Triggering git deploy for commit ${commitSha}...`);
    
    const body = {
      name: "taylorswift",
      project: projectId,
      gitSource: {
        type: "github",
        repoId: repoId,
        ref: "main",
        sha: commitSha
      },
      target: "production"
    };

    const res = await axios.post('https://api.vercel.com/v13/deployments', body, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("\n✅ Deployment Triggered!");
    console.log(`Deployment ID: ${res.data.id}`);
    console.log(`State: ${res.data.readyState}`);
    console.log(`Inspector URL: ${res.data.inspectorUrl}`);

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

triggerDeploy();
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const token = process.env.VERCEL_ACCESS_TOKEN;
const projectId = "prj_ATfejMDqrLF5ntU0LBfm31RdaPoe"; // From previous step

async function redeploy() {
  try {
    console.log(`Triggering redeploy for project ${projectId}...`);
    
    // 1. Get latest deployment to find configuration
    const { data: deployments } = await axios.get(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!deployments.deployments.length) {
        console.error("No previous deployments found to redeploy.");
        return;
    }

    const latest = deployments.deployments[0];
    console.log("Latest deployment:", latest.uid, latest.state);

    // 2. Trigger redeploy
    const res = await axios.post('https://api.vercel.com/v13/deployments', {
        name: latest.name,
        deploymentId: latest.uid, // Redeploy this specific deployment ID
        meta: {
            action: "redeploy"
        },
        target: "production"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("\n✅ Redeploy Triggered!");
    console.log(`Deployment ID: ${res.data.id}`);
    console.log(`State: ${res.data.readyState}`);
    console.log(`Inspector URL: ${res.data.inspectorUrl}`);

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

redeploy();
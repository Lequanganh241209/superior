import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const token = process.env.VERCEL_ACCESS_TOKEN;
const projectId = "prj_5yRe4Uq6lLWoo5Rl78XzcY2AVX0y"; // 'superior' project

async function checkDeploy() {
  try {
    console.log(`Checking latest deployment for 'superior' (${projectId})...`);
    
    const { data } = await axios.get(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (data.deployments.length > 0) {
        const d = data.deployments[0];
        console.log(`\nLATEST DEPLOYMENT:`);
        console.log(`ID: ${d.uid}`);
        console.log(`State: ${d.state}`); // READY, BUILDING, ERROR, QUEUED
        console.log(`Created: ${new Date(d.created).toLocaleString()}`);
        console.log(`Commit: ${d.meta?.githubCommitMessage || 'N/A'}`);
        console.log(`Inspector: ${d.inspectorUrl}`);
        
        if (d.state === 'ERROR') {
             console.log(`Error Code: ${d.errorCode}`);
        }
    } else {
        console.log("No deployments found.");
    }

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

checkDeploy();

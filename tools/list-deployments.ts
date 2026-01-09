import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const token = process.env.VERCEL_ACCESS_TOKEN;
console.log("Token present:", !!token);
const projectId = "prj_ATfejMDqrLF5ntU0LBfm31RdaPoe"; // Taylor Swift project

async function listDeployments() {
  try {
    console.log(`Listing deployments for project ${projectId}...`);
    
    const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    data.deployments.forEach((d: any) => {
        console.log(`\nID: ${d.uid}`);
        console.log(`Name: ${d.name}`);
        console.log(`State: ${d.state}`);
        console.log(`Created: ${new Date(d.created).toLocaleString()}`);
        console.log(`Inspector: ${d.inspectorUrl}`);
        if (d.state === 'ERROR') {
            console.log(`Error Code: ${d.errorCode}`);
        }
    });

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

listDeployments();
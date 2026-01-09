import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const token = process.env.VERCEL_ACCESS_TOKEN;
const deploymentId = "dpl_7Xh5q57i86BLH4dzeNHYEY5xzJhY";

async function getLogs() {
  try {
    console.log(`Fetching logs for ${deploymentId}...`);
    
    // Get deployment details first to see state
    const { data: deployment } = await axios.get(`https://api.vercel.com/v13/deployments/${deploymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`State: ${deployment.readyState}`);
    console.log(`URL: https://${deployment.url}`); // Get the URL
    console.log(`Error Code: ${deployment.errorCode}`);
    console.log(`Error Message:`, deployment.error);

    // Only try to get build logs if it failed or is ready
    // Note: Vercel logs API is a bit complex, often requiring a separate endpoint for build logs
    // endpoint: /v3/deployments/{id}/events
    const { data: events } = await axios.get(`https://api.vercel.com/v3/deployments/${deploymentId}/events`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("\n--- BUILD LOGS ---");
    events.forEach((e: any) => {
        const msg = e.text || e.payload?.text;
        if (msg) {
            console.log(msg);
        }
    });

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

getLogs();
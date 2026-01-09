import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const token = process.env.VERCEL_ACCESS_TOKEN;

async function main() {
  try {
    console.log("Fetching Vercel projects...");
    const res = await axios.get('https://api.vercel.com/v9/projects', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("\nFound Projects:");
    res.data.projects.forEach((p: any) => {
      console.log(`- Name: ${p.name}`);
      console.log(`  ID: ${p.id}`);
      console.log(`  Repo: ${p.link?.type} - ${p.link?.repo}`);
      console.log(`  Latest Deployment: ${p.latestDeployments?.[0]?.readyState || 'N/A'}`);
      console.log("---");
    });

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

main();
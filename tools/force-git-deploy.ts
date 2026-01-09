import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const token = process.env.VERCEL_ACCESS_TOKEN;

async function main() {
  try {
    console.log("Forcing Git Deployment...");
    const res = await axios.post('https://api.vercel.com/v13/deployments', {
        name: "taylorswift",
        project: "prj_ATfejMDqrLF5ntU0LBfm31RdaPoe",
        gitSource: {
            type: "github",
            repo: "Lequanganh241209/taylorswift",
            ref: "main",
            repoId: "1130228767"
        },
        target: "production"
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log("\n✅ Deployment Created!");
    console.log(`ID: ${res.data.id}`);
    console.log(`URL: ${res.data.url}`);
    console.log(`Inspector: ${res.data.inspectorUrl}`);

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

main();
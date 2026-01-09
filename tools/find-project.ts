import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const token = process.env.VERCEL_ACCESS_TOKEN;

async function findProject(search: string) {
  try {
    console.log(`Searching for project "${search}"...`);
    
    const { data } = await axios.get('https://api.vercel.com/v9/projects', {
      headers: { Authorization: `Bearer ${token}` },
      params: { search }
    });

    data.projects.forEach((p: any) => {
        console.log(`\nName: ${p.name}`);
        console.log(`ID: ${p.id}`);
        console.log(`Framework: ${p.framework}`);
        console.log(`Updated: ${new Date(p.updatedAt).toLocaleString()}`);
        console.log(`Link: https://${p.targets?.production?.alias?.[0] || p.name + '.vercel.app'}`);
    });

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
  }
}

const query = process.argv[2] || "superior";
findProject(query);

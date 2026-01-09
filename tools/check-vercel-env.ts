import { setProjectEnv } from '../src/lib/vercel/service';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const projectId = process.argv[2] || "prj_s4pAKgWphmcFSlUpP0Yd8cTBdl0i"; // superior-roan
const token = process.env.VERCEL_ACCESS_TOKEN;

async function checkAndFixEnv() {
    if (!token) {
        console.error("❌ Local VERCEL_ACCESS_TOKEN is missing!");
        return;
    }

    console.log(`Checking envs for project ${projectId}...`);

    try {
        // 1. Get Project to confirm it exists
        const projRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!projRes.ok) {
            console.error("❌ Project not found or access denied.");
            return;
        }

        const proj = await projRes.json();
        console.log(`Project Found: ${proj.name}`);

        // 2. List Envs
        const listRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await listRes.json();
        const envs = data.envs || [];
        
        const hasToken = envs.find((e: any) => e.key === 'VERCEL_ACCESS_TOKEN');
        const hasOpenAI = envs.find((e: any) => e.key === 'OPENAI_API_KEY');

        if (hasToken) {
            console.log("✅ VERCEL_ACCESS_TOKEN is present on Vercel.");
        } else {
            console.log("❌ VERCEL_ACCESS_TOKEN is MISSING on Vercel.");
            console.log("Adding it now...");
            await addEnv(projectId, "VERCEL_ACCESS_TOKEN", token);
        }

        if (hasOpenAI) {
            console.log("✅ OPENAI_API_KEY is present on Vercel.");
        } else {
            console.log("❌ OPENAI_API_KEY is MISSING on Vercel.");
             if (process.env.OPENAI_API_KEY) {
                console.log("Adding it now...");
                await addEnv(projectId, "OPENAI_API_KEY", process.env.OPENAI_API_KEY);
             } else {
                 console.warn("⚠️ Local OPENAI_API_KEY missing, cannot add to Vercel.");
             }
        }

    } catch (error: any) {
        console.error("Error:", error.message);
    }
}

async function addEnv(projectId: string, key: string, value: string) {
    const res = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            key,
            value,
            target: ["production", "preview", "development"],
            type: "encrypted"
        })
    });

    if (res.ok) {
        console.log(`✅ Successfully added ${key}`);
    } else {
        const err = await res.json();
        console.error(`❌ Failed to add ${key}:`, err);
    }
}

checkAndFixEnv();

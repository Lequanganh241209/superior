const fs = require('fs');
const path = require('path');

// Load .env.local manually
let env = {};
try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                let value = match[2].trim();
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                env[key] = value;
            }
        });
    }
} catch (e) {
    console.error("Error reading .env.local", e);
}

const token = env.VERCEL_OIDC_TOKEN || env.VERCEL_ACCESS_TOKEN || process.env.VERCEL_ACCESS_TOKEN;
const projectId = "prj_5yRe4Uq6lLWoo5Rl78XzcY2AVX0y"; 

if (!token) {
    console.error("No VERCEL_ACCESS_TOKEN found.");
    process.exit(1);
}

async function checkStatus() {
    try {
        console.log("Checking Vercel deployment status...");
        const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1&target=production`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
            console.error(`API Error: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error(text);
            return;
        }

        const data = await res.json();
        const latest = data.deployments[0];

        if (!latest) {
            console.log("No deployments found.");
            return;
        }

        console.log("\n--- LATEST DEPLOYMENT ---");
        console.log(`ID: ${latest.uid}`);
        console.log(`State: ${latest.state}`); // BUILDING, READY, ERROR
        console.log(`Created: ${new Date(latest.created).toLocaleString()}`);
        console.log(`Commit: ${latest.meta?.githubCommitMessage || 'N/A'}`);
        console.log(`Inspector: https://vercel.com/team/project/deployments/${latest.uid}`);
        console.log("-------------------------");

    } catch (e) {
        console.error("Script Error:", e);
    }
}

checkStatus();

import { disableDeploymentProtection } from '../src/lib/vercel/service';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const projectName = process.argv[2] || "taylorswift";
const token = process.env.VERCEL_ACCESS_TOKEN;

async function run() {
    if (!token) {
        console.error("❌ VERCEL_ACCESS_TOKEN is missing!");
        process.exit(1);
    }

    console.log(`Disabling auth protection for project: ${projectName}...`);
    try {
        await disableDeploymentProtection(projectName, token);
        console.log("✅ Successfully disabled Vercel Auth & Password Protection.");
    } catch (error: any) {
        console.error("❌ Failed to disable protection:", error.message);
    }
}

run();

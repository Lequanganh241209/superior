import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const token = process.env.GITHUB_PAT;
const octokit = new Octokit({ auth: token });
const owner = "Lequanganh241209";
const repo = "taylorswift";

async function checkStructure() {
  try {
    const { data: { tree } } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: "main",
      recursive: "true"
    });

    const files = tree.map((t: any) => t.path);
    
    const required = [
      "src/components/ui/button.tsx",
      "src/components/ui/card.tsx",
      "src/lib/utils.ts",
      "package.json"
    ];

    console.log("Checking for required files...");
    required.forEach(req => {
        const found = files.includes(req);
        console.log(`${req}: ${found ? "✅ Found" : "❌ MISSING"}`);
    });

    // Check tsconfig.json
    const tsConfig = tree.find((t: any) => t.path === "tsconfig.json");
    if (tsConfig && tsConfig.sha) {
        const { data } = await octokit.rest.git.getBlob({
            owner,
            repo,
            file_sha: tsConfig.sha
        });
        const content = Buffer.from(data.content, "base64").toString();
        console.log("\ntsconfig.json:", content);
    } else {
        console.log("\n❌ tsconfig.json MISSING");
    }

    // Check postcss.config.js
    const postcss = tree.find((t: any) => t.path === "postcss.config.js");
    console.log(`\npostcss.config.js: ${postcss ? "✅ Found" : "❌ MISSING"}`);
    
    if (postcss && postcss.sha) {
         const { data } = await octokit.rest.git.getBlob({
            owner,
            repo,
            file_sha: postcss.sha
        });
        const content = Buffer.from(data.content, "base64").toString();
        console.log("Content:", content);
    }

    // Check tsconfig.json
    const tsconfig = tree.find((t: any) => t.path === "tsconfig.json");
    if (tsconfig && tsconfig.sha) {
        const { data } = await octokit.rest.git.getBlob({
            owner,
            repo,
            file_sha: tsconfig.sha
        });
        const content = Buffer.from(data.content, "base64").toString();
        console.log("\ntsconfig.json content:");
        console.log(content);
    }

    // Check src/app/page.tsx
    const page = tree.find((t: any) => t.path === "src/app/page.tsx");
    if (page && page.sha) {
            const { data } = await octokit.rest.git.getBlob({
                owner,
                repo,
                file_sha: page.sha
            });
            const content = Buffer.from(data.content, "base64").toString();
            console.log("\nsrc/app/page.tsx FULL CONTENT START:");
            console.log(content);
            console.log("src/app/page.tsx FULL CONTENT END");
        }

  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

checkStructure();
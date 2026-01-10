import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const token = process.env.GITHUB_PAT;
const octokit = new Octokit({ auth: token });
const owner = "Lequanganh241209";
const repo = "taylorswift";

async function main() {
  try {
    // Get main branch tree
    const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: "heads/main" });
    const { data: commitData } = await octokit.rest.git.getCommit({ owner, repo, commit_sha: refData.object.sha });
    const { data: treeData } = await octokit.rest.git.getTree({ owner, repo, tree_sha: commitData.tree.sha, recursive: "true" });

    // Find page.tsx
    const pageFile = treeData.tree.find(f => f.path === "src/app/page.tsx");
    if (!pageFile) {
        console.log("❌ src/app/page.tsx NOT FOUND");
        return;
    }

    // Get content
    const { data: blob } = await octokit.rest.git.getBlob({ owner, repo, file_sha: pageFile.sha as string });
    const content = Buffer.from(blob.content, "base64").toString("utf-8");
    
    console.log("\n--- CURRENT src/app/page.tsx ---");
    console.log(content);
    console.log("--------------------------------");

  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

main();
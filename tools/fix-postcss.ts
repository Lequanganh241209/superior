import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const token = process.env.GITHUB_PAT;
const octokit = new Octokit({ auth: token });
const owner = "Lequanganh241209";
const repo = "taylorswift";

const POSTCSS_CONTENT = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;

async function main() {
  console.log("🚀 Injecting postcss.config.js...");
  
  try {
    // Get latest commit
    const { data: refData } = await octokit.rest.git.getRef({ owner, repo, ref: "heads/main" });
    const latestCommitSha = refData.object.sha;
    
    // Get Base Tree
    const { data: commitData } = await octokit.rest.git.getCommit({ owner, repo, commit_sha: latestCommitSha });
    const baseTreeSha = commitData.tree.sha;

    // Create Blob
    const { data: blob } = await octokit.rest.git.createBlob({
      owner,
      repo,
      content: Buffer.from(POSTCSS_CONTENT).toString("base64"),
      encoding: "base64",
    });

    // Create New Tree
    const { data: newTree } = await octokit.rest.git.createTree({
      owner,
      repo,
      base_tree: baseTreeSha,
      tree: [
        {
            path: "postcss.config.js",
            mode: "100644",
            type: "blob",
            sha: blob.sha
        }
      ],
    });

    // Create Commit
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner,
      repo,
      message: "fix: 🔧 Add postcss.config.js for Tailwind CSS",
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    // Update Ref
    await octokit.rest.git.updateRef({
      owner,
      repo,
      ref: "heads/main",
      sha: newCommit.sha,
    });

    console.log("✅ postcss.config.js injected successfully!");
    console.log(`Commit: ${newCommit.sha}`);

  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

main();
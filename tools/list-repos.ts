import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const token = process.env.GITHUB_PAT;
if (!token) {
    console.error("No GITHUB_PAT found");
    process.exit(1);
}
const octokit = new Octokit({ auth: token });

async function listRepos() {
  console.log("Fetching repos for authenticated user...");
  try {
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: "updated",
        per_page: 20,
        type: "all"
      });
      console.log("Recent repos:");
      data.forEach(r => console.log(`- ${r.full_name} (private: ${r.private})`));
  } catch (e: any) {
      console.error("Error listing repos:", e.message);
  }
}

listRepos().catch(console.error);
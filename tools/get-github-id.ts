import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const token = process.env.GITHUB_PAT;
const octokit = new Octokit({ auth: token });

async function main() {
  try {
    const { data } = await octokit.rest.repos.get({
      owner: "Lequanganh241209",
      repo: "taylorswift"
    });
    console.log(`Repo ID: ${data.id}`);
    console.log(`Full Name: ${data.full_name}`);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

main();
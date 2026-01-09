import { generateRepairChanges } from "../src/lib/evolution/repair";
import { pushFilesToRepo } from "../src/lib/github/service";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const args = process.argv.slice(2);
const repoName = args[0]; // e.g. "username/repo"

if (!repoName) {
  console.error("Usage: npx tsx tools/repair-repo.ts <owner/repo>");
  process.exit(1);
}

async function main() {
  console.log(`🔍 Analyzing ${repoName} for build issues...`);
  
  const [owner, repo] = repoName.split("/");
  if (!owner || !repo) {
      console.error("Invalid repo format. Use owner/repo");
      process.exit(1);
  }

  try {
      let changes = await generateRepairChanges(owner, repo);
      const force = args.includes("--force");
      
      if (changes.length === 0) {
          if (force) {
            console.log("⚠️ No logic fixes needed, but --force flag detected.");
            console.log("👉 Adding a trigger file to force Vercel build...");
            changes.push({
                path: "force-rebuild.txt",
                content: `Force rebuild triggered at ${new Date().toISOString()}`
            });
          } else {
            console.log("✅ No issues found. Project is healthy.");
            console.log("💡 Tip: Run with --force to push a dummy commit and trigger Vercel build.");
            return;
          }
      }

      console.log(`🛠️ Found ${changes.length} files to fix:`);
      changes.forEach(c => console.log(`   - ${c.path}`));

      console.log("🚀 Applying fixes...");
      const result = await pushFilesToRepo(
          owner, 
          repo, 
          "Hotfix: Repair Build Paths (Manual Trigger)", 
          changes
      );

      if (result.success) {
          console.log(`✅ Success! Fixes pushed to main. Vercel build should start shortly.`);
          console.log(`Commit SHA: ${result.sha}`);
      } else {
          console.error("❌ Failed to push fixes:", result.error);
      }

  } catch (error) {
      console.error("❌ Error:", error);
  }
}

main();

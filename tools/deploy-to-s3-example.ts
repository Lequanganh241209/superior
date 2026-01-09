
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import mime from "mime-types"; // You might need to install this: npm install mime-types

// EXAMPLE: How to deploy the generated 'out' folder to S3/R2
// Usage: npx ts-node tools/deploy-to-s3-example.ts <project-path>

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.S3_ENDPOINT, // e.g. https://<accountid>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

async function uploadFolder(folderPath: string, bucketName: string) {
  const files = getAllFiles(folderPath);
  
  console.log(`Deploying ${files.length} files to ${bucketName}...`);

  for (const file of files) {
    const relativePath = path.relative(folderPath, file);
    const fileContent = fs.readFileSync(file);
    const contentType = mime.lookup(file) || "application/octet-stream";

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: relativePath.replace(/\\/g, "/"), // Ensure forward slashes
      Body: fileContent,
      ContentType: contentType,
    }));
    
    console.log(`Uploaded: ${relativePath}`);
  }
  
  console.log("Deployment Complete!");
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

// Check if running directly
if (require.main === module) {
    const projectPath = process.argv[2];
    if (!projectPath) {
        console.error("Please provide project path");
        process.exit(1);
    }
    // uploadFolder(path.join(projectPath, "out"), "my-bucket-name");
    console.log("This is an example script. Configure env vars and uncomment execution line.");
}


import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";

// Initialize S3 Client (Works with AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO)
// Configure these in your .env.local
const s3Client = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT, // e.g., https://<account_id>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "superior-sites";
export const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || "https://sites.superior.com";

export interface UploadFile {
  path: string; // e.g., "index.html", "css/style.css"
  content: string | Buffer;
}

/**
 * Uploads a set of files to S3/R2 under a project folder.
 * Result URL: https://<S3_PUBLIC_URL>/<projectName>/index.html
 */
export async function deployToS3(projectName: string, files: UploadFile[]) {
  try {
    console.log(`Starting S3 deployment for ${projectName} (${files.length} files)...`);
    
    // Batch uploads to avoid overwhelming the network
    const BATCH_SIZE = 10;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (file) => {
            // Normalize path: remove leading slash if any
            const cleanPath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
            const key = `${projectName}/${cleanPath}`;
            
            const contentType = mime.lookup(cleanPath) || "application/octet-stream";
            
            // Convert string content to Buffer if needed, or keep as is
            const body = typeof file.content === 'string' ? Buffer.from(file.content) : file.content;

            const command = new PutObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: key,
                Body: body,
                ContentType: contentType,
                // ACL: "public-read", // NOTE: Cloudflare R2 doesn't support ACLs. Use Bucket Policies or Public Access.
            });

            await s3Client.send(command);
        }));
        console.log(`Uploaded batch ${i / BATCH_SIZE + 1}`);
    }

    const deployUrl = `${S3_PUBLIC_URL}/${projectName}/index.html`;
    console.log(`Deployment successful: ${deployUrl}`);

    return {
      success: true,
      url: deployUrl,
      filesUploaded: files.length
    };
  } catch (error: any) {
    console.error("S3 Deployment Error:", error);
    throw new Error(`S3 Upload Failed: ${error.message}`);
  }
}

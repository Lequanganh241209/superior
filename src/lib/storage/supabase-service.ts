
import { adminClient } from "../supabase/admin";
import mime from "mime-types";

const BUCKET_NAME = "sites";

export interface UploadFile {
  path: string;
  content: string | Buffer;
}

export async function deployToSupabase(projectName: string, files: UploadFile[]) {
    if (!adminClient) {
        throw new Error("Supabase Admin Client not initialized. Missing SUPABASE_SERVICE_ROLE_KEY?");
    }

    // 1. Ensure Bucket Exists (Idempotent)
    const { data: buckets } = await adminClient.storage.listBuckets();
    const bucketExists = buckets?.find(b => b.name === BUCKET_NAME);
    
    if (!bucketExists) {
        // Try to create public bucket
        const { error: createError } = await adminClient.storage.createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/*', 'text/*', 'application/*']
        });
        if (createError) {
             // If creation fails (e.g. permissions), we proceed and hope it exists or user created it
             console.warn("Could not create bucket automatically:", createError.message);
        }
    }

    console.log(`Deploying ${files.length} files to Supabase Storage...`);
    const BATCH_SIZE = 5; // Supabase might rate limit
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (file) => {
            const cleanPath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
            const filePath = `${projectName}/${cleanPath}`;
            const contentType = mime.lookup(cleanPath) || "text/plain";
            
            const body = typeof file.content === 'string' ? Buffer.from(file.content) : file.content;

            const { error } = await adminClient!.storage
                .from(BUCKET_NAME)
                .upload(filePath, body, {
                    contentType,
                    upsert: true
                });

            if (error) {
                console.error(`Failed to upload ${filePath}:`, error.message);
                throw new Error(`Upload failed: ${error.message}`);
            }
        }));
    }

    // Construct Public URL
    // Format: https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<path>
    // We need to extract project ref from URL or env
    // process.env.NEXT_PUBLIC_SUPABASE_URL usually looks like: https://xyz.supabase.co
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${projectName}/index.html`;

    return {
        success: true,
        url: publicUrl,
        provider: "Supabase Storage"
    };
}


import { NextRequest, NextResponse } from "next/server";
import { deployToS3 } from "@/lib/storage/s3-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, files } = body;

    // Validate Input
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Missing or invalid 'name'" }, { status: 400 });
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "Missing or invalid 'files'" }, { status: 400 });
    }

    // Perform S3 Deployment
    // Note: 'files' should be an array of { path: string, content: string }
    const result = await deployToS3(name, files);

    return NextResponse.json({
      success: true,
      url: result.url,
      provider: "S3-Compatible Storage",
      details: result
    });
  } catch (error: any) {
    console.error("Deploy API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

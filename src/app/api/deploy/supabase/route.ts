
import { NextRequest, NextResponse } from "next/server";
import { deployToSupabase } from "@/lib/storage/supabase-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, files } = body;

    if (!name || !files) {
      return NextResponse.json({ error: "Missing name or files" }, { status: 400 });
    }

    const result = await deployToSupabase(name, files);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Supabase Deploy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

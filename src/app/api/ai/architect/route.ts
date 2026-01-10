import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API Key is missing. Please add OPENAI_API_KEY to your .env.local file." },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are Aether Architect, an elite software architect AI. 
          Analyze the user's project prompt and generate a JSON response containing:
          1. 'sql': A valid PostgreSQL schema creation script.
          2. 'nodes': An array of ReactFlow nodes (id, type, label, x, y, style?).
          3. 'edges': An array of ReactFlow edges (id, source, target, animated?).
          
          Focus on creating a logical flow and a robust database schema.`
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("AI Architect Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

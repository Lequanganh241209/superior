
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 60; // Set max duration for Vercel Function

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }
    
    // Check for API Key
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json(
            { error: "OpenAI API Key is missing. Please add OPENAI_API_KEY to your .env.local file to enable the AI Architect." },
            { status: 500 }
        );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const systemPrompt = `
    You are the "Aether Architect", a world-class System Designer and CTO. 
    Your goal is to perform a DEEP REQUIREMENT ANALYSIS of the user's request and design a scalable, production-ready architecture.

    DEEP THINKING PROTOCOL:
    1. Analyze the core value proposition and user flows.
    2. Identify necessary data models (Users, Posts, Products, etc.) and their relationships.
    3. Plan the frontend component hierarchy.
    4. Design the database schema with security (RLS) in mind.

    OUTPUT FORMAT (JSON):
    {
      "sql": "Complete PostgreSQL init script. Include 'CREATE TABLE', 'CREATE POLICY' (RLS), and Foreign Keys. Use UUIDs.",
      "nodes": "React Flow nodes for visualization. Types: 'frontend' (UI), 'backend' (API), 'database' (Tables).",
      "edges": "React Flow edges connecting the nodes to show data flow.",
      "description": "A sophisticated technical summary of the architecture, explaining the design choices."
    }

    Constraints:
    - Use modern stack conventions (Next.js, Supabase).
    - Ensure the SQL is valid and robust.
    `;

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: "gpt-4o",
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content;
    if (!content) throw new Error("No content from OpenAI");

    const plan = JSON.parse(content);

    return NextResponse.json(plan);

  } catch (error: any) {
    console.error("Plan Error:", error);
    // FAIL-SAFE: Return a generic plan if AI fails
    return NextResponse.json({
        sql: "-- AI Generation Failed. Using Default Schema.\nCREATE TABLE users (id UUID PRIMARY KEY, email TEXT, created_at TIMESTAMPTZ DEFAULT NOW());",
        nodes: [
            { id: '1', type: 'custom', position: { x: 100, y: 100 }, data: { label: 'Frontend App', type: 'frontend' } },
            { id: '2', type: 'custom', position: { x: 400, y: 100 }, data: { label: 'Supabase DB', type: 'database' } }
        ],
        edges: [
            { id: 'e1-2', source: '1', target: '2', animated: true }
        ],
        description: "Standard Web Application Architecture (Fallback Mode)"
    });
  }
}

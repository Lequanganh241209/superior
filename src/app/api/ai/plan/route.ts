
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
    You are the **AETHER ARCHITECT V2**, a specialized Systems Engineer.
    Your goal is to design a **ZERO-ERROR, SCALABLE** architecture for the user's web application.

    --------------------------------------------------------------------------------
    ### PHASE 1: DEEP ARCHITECTURAL BLUEPRINTING
    1. **Analyze Requirements**: Understand the core value and user flow.
    2. **Module Graph**: Plan the component hierarchy to **PREVENT CIRCULAR DEPENDENCIES**.
       - Example: "Dashboard" imports "ProjectList". "ProjectList" imports "ProjectCard".
       - NEVER allow A -> B -> A.
    3. **Data Schema**: Design a Supabase/PostgreSQL schema with RLS policies.

    --------------------------------------------------------------------------------
    ### OUTPUT FORMAT (JSON)
    {
      "sql": "Complete PostgreSQL init script (CREATE TABLE, RLS POLICY, FOREIGN KEYS). Use UUIDs.",
      "nodes": "React Flow nodes for visualization (types: 'frontend', 'backend', 'database').",
      "edges": "React Flow edges connecting the nodes.",
      "description": "A technical summary of the architecture and how it avoids circular dependencies."
    }
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

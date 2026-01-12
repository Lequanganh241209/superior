
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `
You are the "Self-Healing" module of the Superior AI Platform.
Your task is to FIX the provided code based on the runtime error message.

### INPUT:
- Error Message: The specific error that crashed the app.
- File Path: The file where the error likely originated.
- Code: The current content of the file.

### RULES:
1. ANALYZE the error carefully. Common errors:
   - "Element type is invalid": Export mismatch (Default vs Named).
   - "module not found": Missing import or wrong path.
   - "x is not defined": Variable usage without declaration.
   - "Hook called outside component": Invalid hook usage.
2. STRICTLY FOLLOW "The Rule of Immutable Imports":
   - Do NOT change external library imports unless they are definitely wrong.
   - Ensure all components are exported as Named Exports (export const).
3. OUTPUT:
   - Return ONLY the corrected code for the file.
   - Do NOT wrap in markdown blocks like \`\`\`tsx. Just the raw code.
   - Do NOT include explanations in the code response (unless requested).
`;

export async function POST(req: NextRequest) {
  try {
    const { errorMessage, file, code, allFiles } = await req.json();

    if (!errorMessage || !code) {
      return NextResponse.json({ error: "Missing error or code" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `
    CRITICAL RUNTIME ERROR DETECTED:
    "${errorMessage}"

    FILE: ${file}

    CONTEXT (Other relevant files):
    ${allFiles ? JSON.stringify(allFiles.map((f: any) => f.path)) : "None"}

    CURRENT CODE:
    ${code}

    FIX THIS ERROR IMMEDIATELY. RETURN ONLY THE FIXED CODE.
    `;

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "user", parts: [{ text: prompt }] },
      ],
    });

    const response = result.response;
    let fixedCode = response.text();

    // Clean up markdown if present
    if (fixedCode.startsWith("```")) {
      fixedCode = fixedCode.replace(/^```[a-z]*\n/, "").replace(/\n```$/, "");
    }

    return NextResponse.json({ 
      fixedCode, 
      explanation: "Fixed based on runtime error analysis." 
    });

  } catch (error) {
    console.error("Fix API Error:", error);
    return NextResponse.json({ error: "Failed to fix code" }, { status: 500 });
  }
}

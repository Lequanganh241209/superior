// Tự động test code sau khi generate
export async function autoTest(files: Record<string, string>) {
  console.log("[AUTO-TEST] Running automated tests...");
  const tests = [];
  
  // 1. Check if components render (Static Analysis)
  for (const [path, code] of Object.entries(files)) {
    if (path.includes('components')) {
      tests.push(testComponentStructure(path, code));
    }
  }
  
  // 2. Check if no console.errors (Runtime simulation not possible here, so we check for suspicious patterns)
  tests.push(testNoForbiddenLogs(files));
  
  const results = await Promise.all(tests);
  const passed = results.every(r => r.passed);
  console.log(`[AUTO-TEST] Result: ${passed ? "PASSED" : "FAILED"}`);
  return passed;
}

async function testComponentStructure(path: string, code: string) {
    const hasExport = code.includes("export function") || code.includes("export const");
    const hasReactImport = code.includes("import * as React") || code.includes("import React");
    
    return {
        test: `Component Structure: ${path}`,
        passed: hasExport,
        error: hasExport ? null : "Missing export statement"
    };
}

async function testNoForbiddenLogs(files: Record<string, string>) {
    // Check for "console.error" hardcoded in production code
    const allCode = Object.values(files).join("");
    const hasErrorLog = allCode.includes("console.error('TODO");
    
    return {
        test: "No TODO Error Logs",
        passed: !hasErrorLog,
        error: hasErrorLog ? "Found TODO error logs" : null
    };
}


import { ValidationEngine, GeneratedFile, ValidationError } from './validator';

export class AutoFixer {
  private validator: ValidationEngine;

  constructor(apiKey?: string) {
    this.validator = new ValidationEngine(apiKey);
  }

  async fixFiles(files: GeneratedFile[], errors: ValidationError[]): Promise<GeneratedFile[]> {
    // Re-use the existing AI fix logic from validator, but exposed as a standalone service
    // This allows for more complex multi-file refactoring in the future
    const result = await this.validator.autoFix(files, errors);
    return result.files;
  }

  async optimizeCode(files: GeneratedFile[]): Promise<GeneratedFile[]> {
    // Future: Implement performance optimization pass
    return files;
  }
}

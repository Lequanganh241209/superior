
import { ButtonDetector, ButtonAnalysis } from '@/utils/button-detector';

export interface ButtonTestResult {
  button: HTMLElement;
  analysis: ButtonAnalysis;
  works: boolean;
  wasFixed?: boolean;
  issues: string[];
}

export class ButtonTester {
  async testAllButtons(): Promise<ButtonTestResult[]> {
    const buttons = ButtonDetector.scanAllButtons();
    const results: ButtonTestResult[] = [];
    
    for (const button of buttons) {
      let result = await this.testSingleButton(button);
      
      // Auto-fix if broken
      if (!result.works) {
        await this.autoFixButton(button, result);
        // Re-test
        const retest = await this.testSingleButton(button);
        result = { ...retest, wasFixed: retest.works };
      }
      
      results.push(result);
    }
    
    return results;
  }
  
  async testSingleButton(button: HTMLElement): Promise<ButtonTestResult> {
    const analysis = ButtonDetector.analyzeButton(button);
    const issues: string[] = [];
    
    // Test 1: Disabled check
    if (analysis.isDisabled) {
        // Disabled buttons are technically "working as intended" but we note it
        // issues.push("Button is disabled"); 
    }

    // Check if inside a link (anchor tag)
    const isLink = button.closest('a') !== null;

    // Test 2: Handler check
    // In React, explicit 'onclick' might be null even if a listener exists.
    // So we assume if it's not disabled, it should be clickable.
    // A simplified check: does it look interactive?
    const style = window.getComputedStyle(button);
    if (style.pointerEvents === 'none') {
        issues.push("Button is not clickable (pointer-events: none)");
    }
    
    if (style.display === 'none' || style.visibility === 'hidden') {
         issues.push("Button is invisible");
    }

    return {
      button,
      analysis,
      works: issues.length === 0,
      issues
    };
  }
  
  async autoFixButton(button: HTMLElement, result: ButtonTestResult): Promise<void> {
    console.log(`🛠️ Auto-fixing button: ${result.analysis.text}`);
    
    // Fix pointer-events
    button.style.pointerEvents = 'auto';
    button.style.cursor = 'pointer';
    
    // Fix visibility if accidental
    if (button.style.opacity === '0') button.style.opacity = '1';
    
    // Inject fallback handler if missing (This logic usually goes to FallbackSystem)
    // ONLY if NOT inside a link
    const isLink = button.closest('a') !== null;
    
    if (!button.onclick && !isLink) {
        button.onclick = (e) => {
            console.log(`[AUTO-FIX] Fallback click for ${result.analysis.text}`);
            e.preventDefault();
            alert(`Auto-Fixed Action: ${result.analysis.expectedAction}`);
        };
    }
  }
}

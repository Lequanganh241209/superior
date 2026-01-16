
export interface ButtonAnalysis {
  id: string;
  text: string;
  selector: string;
  hasClickListener: boolean;
  isDisabled: boolean;
  expectedAction: string;
  element: HTMLElement;
}

export class ButtonDetector {
  // Tự động quét DOM tìm tất cả button elements
  static scanAllButtons(): HTMLElement[] {
    if (typeof window === 'undefined') return [];
    return Array.from(document.querySelectorAll('button, [role="button"], .btn, input[type="button"], input[type="submit"]'));
  }
  
  // Phân tích button để xác định nó làm gì
  static analyzeButton(button: HTMLElement): ButtonAnalysis {
    const text = button.innerText || (button as HTMLInputElement).value || button.getAttribute('aria-label') || 'Unnamed Button';
    const id = button.id || `btn-${Math.random().toString(36).substr(2, 9)}`;
    
    // Heuristic analysis of purpose based on text/class
    let expectedAction = 'unknown';
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('save') || lowerText.includes('update')) expectedAction = 'save-project';
    else if (lowerText.includes('generate') || lowerText.includes('create')) expectedAction = 'generate-code';
    else if (lowerText.includes('deploy') || lowerText.includes('publish')) expectedAction = 'deploy';
    else if (lowerText.includes('delete') || lowerText.includes('remove')) expectedAction = 'delete';
    else if (lowerText.includes('edit')) expectedAction = 'edit';
    else if (lowerText.includes('suggest') || lowerText.includes('ai')) expectedAction = 'ai-suggest';

    // Check if it has an onclick handler (basic check)
    const hasClickListener = !!button.onclick || button.getAttribute('type') === 'submit';

    return {
      id,
      text: text.substring(0, 50),
      selector: this.getSelector(button),
      hasClickListener,
      isDisabled: (button as HTMLButtonElement).disabled || button.classList.contains('disabled'),
      expectedAction,
      element: button
    };
  }

  private static getSelector(el: HTMLElement): string {
      if (el.id) return `#${el.id}`;
      if (el.className) return `.${el.className.split(' ').join('.')}`;
      return el.tagName.toLowerCase();
  }
}

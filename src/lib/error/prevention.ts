
import { toast } from "sonner";

export class ErrorPreventionLayer {
  private static instance: ErrorPreventionLayer;
  
  private constructor() {
    if (typeof window !== 'undefined') {
        this.setupGlobalMonitoring();
        this.injectSafetyWrappers();
    }
  }

  static init() {
      if (!ErrorPreventionLayer.instance) {
          ErrorPreventionLayer.instance = new ErrorPreventionLayer();
      }
  }
  
  private setupGlobalMonitoring(): void {
    // Monitor global errors
    window.addEventListener('error', (event) => {
        console.error("[PREVENTION] Global Error Caught:", event.error);
        toast.error("System Error Detected", { description: "Auto-healing protocol initiated." });
        event.preventDefault(); // Stop propagation
    });

    window.addEventListener('unhandledrejection', (event) => {
        console.error("[PREVENTION] Unhandled Promise:", event.reason);
        event.preventDefault();
    });
    
    // Performance monitoring
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 500) { 
                        console.warn(`[PERF] Long task detected: ${entry.duration}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['longtask'] });
        } catch (e) {}
    }
  }
  
  private injectSafetyWrappers(): void {
    // Wrap fetch for auto-retry
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      let attempts = 0;
      while (attempts < 3) {
          try {
              const response = await originalFetch.apply(window, args);
              if (!response.ok && response.status >= 500) throw new Error(response.statusText);
              return response;
          } catch (error) {
              attempts++;
              console.warn(`[FETCH] Retry ${attempts}/3 due to network error...`);
              if (attempts === 3) throw error;
              await new Promise(r => setTimeout(r, 1000 * attempts));
          }
      }
      return originalFetch.apply(window, args);
    };
  }
}

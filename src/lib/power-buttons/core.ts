
import React from 'react';

// --- CORE TYPES ---
export type PowerButtonId = 
  | 'magic-boost' | 'competitor-crush' | 'money-maker' | 'time-travel'
  | 'user-whisperer' | 'legal-shield' | 'viral-engine' | 'seo-dominator'
  | 'speed-demon' | 'conversion-wizard' | 'brand-alchemist' | 'crisis-mode';

export interface PowerButtonConfig {
  id: PowerButtonId;
  label: string;
  icon: string;
  tooltip: string;
  position: 'top-right' | 'bottom-right' | 'bottom-left' | 'center-admin' | 'sticky-header';
  color: string;
  action: () => Promise<any>;
}

// --- ANALYTICS TRACKER ---
export const ButtonAnalytics = {
  trackClick: (id: PowerButtonId) => {
    console.log(`[Analytics] Power Button Clicked: ${id}`);
    // In real app, send to Segment/Mixpanel
  },
  trackSuccess: (id: PowerButtonId, result: any) => {
    console.log(`[Analytics] Power Button Success: ${id}`, result);
  }
};

// --- FALLBACK MECHANISM ---
export async function executeWithFallback(
  primary: () => Promise<any>,
  secondary: () => Promise<any>,
  tertiary: () => any
) {
  try {
    return await primary();
  } catch (e) {
    console.warn("Primary layer failed, trying secondary...");
    try {
      return await secondary();
    } catch (e2) {
      console.warn("Secondary layer failed, using tertiary...");
      return tertiary();
    }
  }
}

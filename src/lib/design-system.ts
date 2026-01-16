
// Complete Design System for Aether Architect 

export const COLORS = { 
  // Brand Colors 
  brand: { 
    violet: { 
      50: '#f5f3ff', 
      100: '#ede9fe', 
      200: '#ddd6fe', 
      300: '#c4b5fd', 
      400: '#a78bfa', 
      500: '#8b5cf6', 
      600: '#7c3aed', 
      700: '#6d28d9', 
      800: '#5b21b6', 
      900: '#4c1d95', 
    }, 
    indigo: { 
      50: '#eef2ff', 
      100: '#e0e7ff', 
      200: '#c7d2fe', 
      300: '#a5b4fc', 
      400: '#818cf8', 
      500: '#6366f1', 
      600: '#4f46e5', 
      700: '#4338ca', 
      800: '#3730a3', 
      900: '#312e81', 
    } 
  }, 

  // Semantic Colors 
  semantic: { 
    success: '#10b981', 
    error: '#ef4444', 
    warning: '#f59e0b', 
    info: '#3b82f6' 
  }, 

  // Grayscale (for dark theme) 
  gray: { 
    50: 'rgba(255, 255, 255, 0.05)', 
    100: 'rgba(255, 255, 255, 0.1)', 
    200: 'rgba(255, 255, 255, 0.2)', 
    300: 'rgba(255, 255, 255, 0.3)', 
    400: 'rgba(255, 255, 255, 0.4)', 
    500: 'rgba(255, 255, 255, 0.5)', 
    600: 'rgba(255, 255, 255, 0.6)', 
    700: 'rgba(255, 255, 255, 0.7)', 
    800: 'rgba(255, 255, 255, 0.8)', 
    900: 'rgba(255, 255, 255, 0.9)', 
  } 
}; 

export const GRADIENTS = { 
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
  secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
  success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
  warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
  violet: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)', 
  mesh: ` 
    radial-gradient(at 40% 20%, rgba(124, 58, 237, 0.3) 0px, transparent 50%), 
    radial-gradient(at 80% 0%, rgba(79, 70, 229, 0.3) 0px, transparent 50%), 
    radial-gradient(at 0% 50%, rgba(139, 92, 246, 0.3) 0px, transparent 50%), 
    radial-gradient(at 80% 50%, rgba(99, 102, 241, 0.3) 0px, transparent 50%), 
    radial-gradient(at 0% 100%, rgba(124, 58, 237, 0.3) 0px, transparent 50%), 
    radial-gradient(at 80% 100%, rgba(79, 70, 229, 0.3) 0px, transparent 50%) 
  ` 
}; 

export const SHADOWS = { 
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', 
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
  glow: { 
    violet: '0 0 40px -10px rgba(124, 58, 237, 0.5)', 
    indigo: '0 0 40px -10px rgba(79, 70, 229, 0.5)', 
    success: '0 0 40px -10px rgba(16, 185, 129, 0.5)', 
    error: '0 0 40px -10px rgba(239, 68, 68, 0.5)', 
  } 
}; 

export const TYPOGRAPHY = { 
  fonts: { 
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
    mono: '"Fira Code", "Cascadia Code", Consolas, Monaco, monospace' 
  }, 
  
  sizes: { 
    xs: '0.75rem',    // 12px 
    sm: '0.875rem',   // 14px 
    base: '1rem',     // 16px 
    lg: '1.125rem',   // 18px 
    xl: '1.25rem',    // 20px 
    '2xl': '1.5rem',  // 24px 
    '3xl': '1.875rem',// 30px 
    '4xl': '2.25rem', // 36px 
    '5xl': '3rem',    // 48px 
  }, 
  
  weights: { 
    normal: 400, 
    medium: 500, 
    semibold: 600, 
    bold: 700, 
    black: 900 
  }, 
  
  lineHeights: { 
    tight: 1.25, 
    normal: 1.5, 
    relaxed: 1.75, 
    loose: 2 
  } 
}; 

export const SPACING = { 
  0: '0px', 
  1: '0.25rem',  // 4px 
  2: '0.5rem',   // 8px 
  3: '0.75rem',  // 12px 
  4: '1rem',     // 16px 
  5: '1.25rem',  // 20px 
  6: '1.5rem',   // 24px 
  8: '2rem',     // 32px 
  10: '2.5rem',  // 40px 
  12: '3rem',    // 48px 
  16: '4rem',    // 64px 
  20: '5rem',    // 80px 
  24: '6rem',    // 96px 
}; 

export const EFFECTS = { 
  glass: { 
    background: 'rgba(255, 255, 255, 0.05)', 
    backdropFilter: 'blur(12px)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)' 
  }, 
  
  hover: { 
    scale: 'scale(1.02)', 
    scaleDown: 'scale(0.98)', 
    lift: 'translateY(-2px)', 
    glow: '0 0 20px -5px currentColor' 
  } 
}; 

export const ANIMATIONS = { 
  durations: { 
    fast: '150ms', 
    normal: '300ms', 
    slow: '500ms' 
  }, 
  
  easings: { 
    default: 'cubic-bezier(0.4, 0, 0.2, 1)', 
    in: 'cubic-bezier(0.4, 0, 1, 1)', 
    out: 'cubic-bezier(0, 0, 0.2, 1)', 
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)', 
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' 
  }, 
  
  keyframes: { 
    fadeIn: { 
      from: { opacity: 0 }, 
      to: { opacity: 1 } 
    }, 
    slideUp: { 
      from: { opacity: 0, transform: 'translateY(10px)' }, 
      to: { opacity: 1, transform: 'translateY(0)' } 
    }, 
    scaleIn: { 
      from: { opacity: 0, transform: 'scale(0.95)' }, 
      to: { opacity: 1, transform: 'scale(1)' } 
    }, 
    spin: { 
      from: { transform: 'rotate(0deg)' }, 
      to: { transform: 'rotate(360deg)' } 
    }, 
    pulse: { 
      '0%, 100%': { opacity: 1 }, 
      '50%': { opacity: 0.5 } 
    } 
  } 
}; 

// Utility Functions 
export const utils = { 
  cn: (...classes: (string | undefined | null | false)[]) => { 
    return classes.filter(Boolean).join(' '); 
  }, 
  
  formatRelativeTime: (date: Date): string => { 
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000); 
    if (seconds < 60) return 'Just now'; 
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`; 
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`; 
    return `${Math.floor(seconds / 86400)}d ago`; 
  }, 
  
  formatFileSize: (bytes: number): string => { 
    if (bytes < 1024) return `${bytes} B`; 
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; 
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; 
  }, 
  
  truncate: (str: string, length: number): string => { 
    if (str.length <= length) return str; 
    return str.slice(0, length) + '...'; 
  }, 
  
  debounce: <T extends (...args: any[]) => any>( 
    func: T, 
    wait: number 
  ): ((...args: Parameters<T>) => void) => { 
    let timeout: NodeJS.Timeout; 
    return (...args: Parameters<T>) => { 
      clearTimeout(timeout); 
      timeout = setTimeout(() => func(...args), wait); 
    }; 
  } 
}; 

// Component Variants 
export const BUTTON_VARIANTS = { 
  primary: { 
    base: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white', 
    hover: 'hover:from-violet-500 hover:to-indigo-500', 
    active: 'active:scale-95', 
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed' 
  }, 
  secondary: { 
    base: 'bg-white/5 text-white border border-white/10', 
    hover: 'hover:bg-white/10 hover:border-white/20', 
    active: 'active:scale-95', 
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed' 
  }, 
  ghost: { 
    base: 'text-white', 
    hover: 'hover:bg-white/5', 
    active: 'active:bg-white/10', 
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed' 
  } 
}; 

export const INPUT_VARIANTS = { 
  default: { 
    base: 'bg-white/5 border border-white/10 text-white placeholder:text-white/40', 
    focus: 'focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20', 
    disabled: 'disabled:opacity-50 disabled:cursor-not-allowed' 
  }, 
  error: { 
    base: 'bg-red-500/5 border border-red-500/30 text-white', 
    focus: 'focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
  } 
}; 

// Layout Constants 
export const LAYOUT = { 
  sidebar: { 
    width: '280px', 
    collapsedWidth: '80px' 
  }, 
  header: { 
    height: '64px' 
  }, 
  maxContentWidth: '1200px' 
};

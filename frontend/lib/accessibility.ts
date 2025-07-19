import { useEffect, useRef, useState } from 'react';

// Keyboard navigation utilities
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// Focus management
export const useFocusManagement = () => {
  const focusableElementsSelector = 
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const getFocusableElements = (container?: HTMLElement) => {
    const root = container || document;
    return Array.from(
      root.querySelectorAll(focusableElementsSelector)
    ) as HTMLElement[];
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.TAB) {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  const restoreFocus = (element: HTMLElement | null) => {
    if (element && document.contains(element)) {
      element.focus();
    }
  };

  return {
    getFocusableElements,
    trapFocus,
    restoreFocus,
  };
};

// ARIA live region management
export const useAriaLiveRegion = () => {
  const [liveRegion, setLiveRegion] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const region = document.createElement('div');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    setLiveRegion(region);

    return () => {
      document.body.removeChild(region);
    };
  }, []);

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  return { announce };
};

// Screen reader utilities
export const useScreenReader = () => {
  const [isScreenReaderActive, setIsScreenReaderActive] = useState(false);

  useEffect(() => {
    // Detect screen reader usage
    const detectScreenReader = () => {
      const hasScreenReader = 
        window.navigator.userAgent.includes('JAWS') ||
        window.navigator.userAgent.includes('NVDA') ||
        window.navigator.userAgent.includes('ORCA') ||
        window.speechSynthesis ||
        (window as any).speechSynthesis;

      setIsScreenReaderActive(!!hasScreenReader);
    };

    detectScreenReader();
  }, []);

  return { isScreenReaderActive };
};

// Skip link functionality
export const SkipLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
  >
    {children}
  </a>
);

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(val => {
      const normalized = parseInt(val) / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export const isAccessibleContrast = (
  foreground: string, 
  background: string, 
  level: 'AA' | 'AAA' = 'AA',
  isLargeText = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const threshold = level === 'AAA' 
    ? (isLargeText ? 4.5 : 7) 
    : (isLargeText ? 3 : 4.5);
  
  return ratio >= threshold;
};

// Reduced motion detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReducedMotion;
};

// High contrast mode detection
export const useHighContrast = () => {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches);
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersHighContrast;
};

// ARIA helpers
export const generateAriaLabel = (
  base: string, 
  context?: string, 
  state?: string
): string => {
  let label = base;
  if (context) label += `, ${context}`;
  if (state) label += `, ${state}`;
  return label;
};

export const generateAriaDescribedBy = (ids: string[]): string => {
  return ids.filter(Boolean).join(' ');
};

// Form accessibility
export const useFormAccessibility = () => {
  const validateField = (
    value: string, 
    rules: Array<(val: string) => string | null>
  ): string[] => {
    return rules
      .map(rule => rule(value))
      .filter((error): error is string => error !== null);
  };

  const announceError = (fieldName: string, errors: string[]) => {
    const { announce } = useAriaLiveRegion();
    if (errors.length > 0) {
      announce(`${fieldName} field has errors: ${errors.join(', ')}`, 'assertive');
    }
  };

  return {
    validateField,
    announceError,
  };
};

// Landmark region component
export const LandmarkRegion = ({ 
  as: Component = 'div',
  role,
  ariaLabel,
  ariaLabelledBy,
  children,
  ...props
}: {
  as?: keyof JSX.IntrinsicElements;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  const Element = Component as any;
  
  return (
    <Element
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      {...props}
    >
      {children}
    </Element>
  );
};

// Accessible button component
export const AccessibleButton = ({
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaPressed,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) && onClick) {
      e.preventDefault();
      onClick(e);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Accessible modal dialog
export const useAccessibleModal = () => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { trapFocus } = useFocusManagement();
  const { announce } = useAriaLiveRegion();

  const openModal = (title: string) => {
    const dialog = dialogRef.current;
    if (dialog) {
      document.body.style.overflow = 'hidden';
      dialog.setAttribute('aria-hidden', 'false');
      const cleanup = trapFocus(dialog);
      announce(`${title} dialog opened`);
      
      return cleanup;
    }
  };

  const closeModal = (title: string) => {
    const dialog = dialogRef.current;
    if (dialog) {
      document.body.style.overflow = '';
      dialog.setAttribute('aria-hidden', 'true');
      announce(`${title} dialog closed`);
    }
  };

  return {
    dialogRef,
    openModal,
    closeModal,
  };
};

// Error boundary with accessibility
export class AccessibleErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Accessible Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      return Fallback ? (
        <Fallback error={this.state.error!} />
      ) : (
        <div role="alert" aria-live="assertive" className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-700">An unexpected error occurred. Please refresh the page or try again later.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export all utilities
export default {
  useFocusManagement,
  useAriaLiveRegion,
  useScreenReader,
  useReducedMotion,
  useHighContrast,
  useFormAccessibility,
  useAccessibleModal,
  generateAriaLabel,
  generateAriaDescribedBy,
  getContrastRatio,
  isAccessibleContrast,
  SkipLink,
  LandmarkRegion,
  AccessibleButton,
  AccessibleErrorBoundary,
  KEYBOARD_KEYS,
}; 
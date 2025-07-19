import { useEffect, useRef } from 'react';

// Analytics event types
export interface AnalyticsEvent {
  event: string;
  category: 'user_action' | 'page_view' | 'performance' | 'error' | 'collaboration';
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: number;
}

// Analytics configuration
interface AnalyticsConfig {
  apiUrl: string;
  apiKey: string;
  userId?: string;
  enabledInDevelopment?: boolean;
  bufferSize?: number;
  flushInterval?: number;
}

class AnalyticsService {
  private config: AnalyticsConfig;
  private eventBuffer: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private sessionId: string;
  private userId?: string;

  constructor(config: AnalyticsConfig) {
    this.config = {
      bufferSize: 10,
      flushInterval: 5000,
      enabledInDevelopment: false,
      ...config,
    };
    
    this.sessionId = this.generateSessionId();
    this.userId = config.userId;
    
    // Flush events on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldTrack(): boolean {
    if (process.env.NODE_ENV === 'development' && !this.config.enabledInDevelopment) {
      return false;
    }
    return true;
  }

  track(event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId' | 'userId'>): void {
    if (!this.shouldTrack()) {
      console.log('Analytics (dev mode):', event);
      return;
    }

    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.eventBuffer.push(fullEvent);

    if (this.eventBuffer.length >= this.config.bufferSize!) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flush();
      }, this.config.flushInterval);
    }
  }

  private async flush(immediate = false): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = [...this.eventBuffer];
    this.eventBuffer = [];

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    try {
      if (immediate && 'sendBeacon' in navigator) {
        // Use sendBeacon for reliable sending on page unload
        navigator.sendBeacon(
          this.config.apiUrl,
          JSON.stringify({ events })
        );
      } else {
        await fetch(this.config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({ events }),
        });
      }
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...events);
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  // Page tracking
  pageView(path: string, title?: string): void {
    this.track({
      event: 'page_view',
      category: 'page_view',
      action: 'view',
      label: path,
      properties: {
        path,
        title,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      },
    });
  }

  // User action tracking
  buttonClick(buttonName: string, context?: string): void {
    this.track({
      event: 'button_click',
      category: 'user_action',
      action: 'click',
      label: buttonName,
      properties: { context },
    });
  }

  formSubmit(formName: string, success: boolean, errors?: string[]): void {
    this.track({
      event: 'form_submit',
      category: 'user_action',
      action: success ? 'submit_success' : 'submit_error',
      label: formName,
      properties: { errors },
    });
  }

  searchPerformed(query: string, resultsCount: number, category?: string): void {
    this.track({
      event: 'search',
      category: 'user_action',
      action: 'search',
      label: query,
      value: resultsCount,
      properties: { category },
    });
  }

  // Content interaction tracking
  documentCreate(type: string): void {
    this.track({
      event: 'document_create',
      category: 'user_action',
      action: 'create',
      label: type,
    });
  }

  documentEdit(documentId: string, editType: string): void {
    this.track({
      event: 'document_edit',
      category: 'user_action',
      action: 'edit',
      label: editType,
      properties: { documentId },
    });
  }

  documentShare(documentId: string, shareMethod: string): void {
    this.track({
      event: 'document_share',
      category: 'user_action',
      action: 'share',
      label: shareMethod,
      properties: { documentId },
    });
  }

  // AI feature tracking
  aiFeatureUsed(feature: string, success: boolean, duration?: number): void {
    this.track({
      event: 'ai_feature_used',
      category: 'user_action',
      action: success ? 'ai_success' : 'ai_error',
      label: feature,
      value: duration,
    });
  }

  // Collaboration tracking
  collaborationJoin(pageId: string, userCount: number): void {
    this.track({
      event: 'collaboration_join',
      category: 'collaboration',
      action: 'join',
      label: pageId,
      value: userCount,
    });
  }

  commentCreate(pageId: string, commentType: 'new' | 'reply'): void {
    this.track({
      event: 'comment_create',
      category: 'collaboration',
      action: 'comment',
      label: commentType,
      properties: { pageId },
    });
  }

  // Performance tracking
  performanceMeasure(metric: string, value: number, context?: string): void {
    this.track({
      event: 'performance',
      category: 'performance',
      action: 'measure',
      label: metric,
      value,
      properties: { context },
    });
  }

  // Error tracking
  errorOccurred(error: Error, context?: string): void {
    this.track({
      event: 'error',
      category: 'error',
      action: 'javascript_error',
      label: error.message,
      properties: {
        stack: error.stack,
        context,
        url: window.location.href,
      },
    });
  }
}

// Global analytics instance
let analyticsInstance: AnalyticsService | null = null;

export const initializeAnalytics = (config: AnalyticsConfig): AnalyticsService => {
  analyticsInstance = new AnalyticsService(config);
  return analyticsInstance;
};

export const getAnalytics = (): AnalyticsService | null => {
  return analyticsInstance;
};

// React hooks for analytics
export const useAnalytics = () => {
  const analytics = getAnalytics();

  const trackEvent = (event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId' | 'userId'>) => {
    analytics?.track(event);
  };

  const trackPageView = (path: string, title?: string) => {
    analytics?.pageView(path, title);
  };

  const trackButtonClick = (buttonName: string, context?: string) => {
    analytics?.buttonClick(buttonName, context);
  };

  const trackError = (error: Error, context?: string) => {
    analytics?.errorOccurred(error, context);
  };

  return {
    trackEvent,
    trackPageView,
    trackButtonClick,
    trackError,
    analytics,
  };
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const analytics = getAnalytics();

  useEffect(() => {
    if (!analytics || typeof window === 'undefined') return;

    // Web Vitals tracking
    const trackWebVitals = async () => {
      try {
        const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');

        getCLS((metric) => {
          analytics.performanceMeasure('CLS', metric.value, 'web_vitals');
        });

        getFID((metric) => {
          analytics.performanceMeasure('FID', metric.value, 'web_vitals');
        });

        getFCP((metric) => {
          analytics.performanceMeasure('FCP', metric.value, 'web_vitals');
        });

        getLCP((metric) => {
          analytics.performanceMeasure('LCP', metric.value, 'web_vitals');
        });

        getTTFB((metric) => {
          analytics.performanceMeasure('TTFB', metric.value, 'web_vitals');
        });
      } catch (error) {
        console.warn('Web Vitals tracking not available:', error);
      }
    };

    // Navigation timing
    const trackNavigationTiming = () => {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          analytics.performanceMeasure('DOM_CONTENT_LOADED', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart, 'navigation');
          analytics.performanceMeasure('LOAD_EVENT', navigation.loadEventEnd - navigation.loadEventStart, 'navigation');
          analytics.performanceMeasure('DNS_LOOKUP', navigation.domainLookupEnd - navigation.domainLookupStart, 'navigation');
        }
      }
    };

    // Resource timing
    const trackResourceTiming = () => {
      if ('performance' in window && 'getEntriesByType' in window.performance) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        
        resources.forEach((resource) => {
          if (resource.name.includes('.js') || resource.name.includes('.css')) {
            analytics.performanceMeasure('RESOURCE_LOAD', resource.duration, resource.name);
          }
        });
      }
    };

    // Track after page load
    if (document.readyState === 'complete') {
      trackWebVitals();
      trackNavigationTiming();
      trackResourceTiming();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => {
          trackWebVitals();
          trackNavigationTiming();
          trackResourceTiming();
        }, 100);
      });
    }

    // Error tracking
    const handleError = (event: ErrorEvent) => {
      analytics.errorOccurred(new Error(event.message), 'global_error_handler');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.errorOccurred(new Error(String(event.reason)), 'unhandled_promise_rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [analytics]);

  return { analytics };
};

// Page view tracking hook
export const usePageViewTracking = () => {
  const analytics = getAnalytics();
  const previousPath = useRef<string>('');

  useEffect(() => {
    if (!analytics || typeof window === 'undefined') return;

    const currentPath = window.location.pathname;
    
    if (currentPath !== previousPath.current) {
      analytics.pageView(currentPath, document.title);
      previousPath.current = currentPath;
    }
  }, [analytics]);
};

// User session tracking
export const useSessionTracking = () => {
  const analytics = getAnalytics();

  useEffect(() => {
    if (!analytics || typeof window === 'undefined') return;

    // Track session start
    analytics.track({
      event: 'session_start',
      category: 'user_action',
      action: 'session_start',
      properties: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      },
    });

    // Track session activity
    let lastActivity = Date.now();
    const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 minutes

    const updateActivity = () => {
      lastActivity = Date.now();
    };

    const checkInactivity = () => {
      if (Date.now() - lastActivity > INACTIVE_THRESHOLD) {
        analytics.track({
          event: 'session_inactive',
          category: 'user_action',
          action: 'inactive',
          value: Date.now() - lastActivity,
        });
      }
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    const inactivityTimer = setInterval(checkInactivity, 60000); // Check every minute

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
      clearInterval(inactivityTimer);
    };
  }, [analytics]);
};

// Funnel tracking utilities
export const useFunnelTracking = (funnelName: string) => {
  const analytics = getAnalytics();

  const trackFunnelStep = (step: string, stepNumber: number, success = true) => {
    analytics?.track({
      event: 'funnel_step',
      category: 'user_action',
      action: success ? 'step_completed' : 'step_failed',
      label: `${funnelName}_${step}`,
      value: stepNumber,
      properties: {
        funnelName,
        step,
        stepNumber,
      },
    });
  };

  const trackFunnelConversion = (conversionValue?: number) => {
    analytics?.track({
      event: 'funnel_conversion',
      category: 'user_action',
      action: 'conversion',
      label: funnelName,
      value: conversionValue,
      properties: {
        funnelName,
      },
    });
  };

  return {
    trackFunnelStep,
    trackFunnelConversion,
  };
};

export default {
  initializeAnalytics,
  getAnalytics,
  useAnalytics,
  usePerformanceMonitoring,
  usePageViewTracking,
  useSessionTracking,
  useFunnelTracking,
}; 
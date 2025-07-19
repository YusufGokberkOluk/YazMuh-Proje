import dynamic from 'next/dynamic';
import { ComponentType } from 'react';
import { useEffect, useRef, useState } from 'react';

// Lazy load components with loading states
export const LazyEditor = dynamic(() => import('@/components/editor'), {
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  ),
  ssr: false,
});

export const LazyBlockEditor = dynamic(() => import('@/components/block-editor'), {
  loading: () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
      ))}
    </div>
  ),
  ssr: false,
});

export const LazyCommentsPanel = dynamic(() => import('@/components/comments-panel'), {
  loading: () => (
    <div className="w-80 h-full bg-white border-l border-gray-200 animate-pulse">
      <div className="p-4 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  ),
});

export const LazyAIActionsPopup = dynamic(() => import('@/components/ai-actions-popup'), {
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
});

export const LazyShareModal = dynamic(() => import('@/components/share-modal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});

export const LazyTemplatesView = dynamic(() => import('@/components/templates-view'), {
  loading: () => (
    <div className="container mx-auto p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  ),
});

export const LazyAccountSettings = dynamic(() => import('@/components/account-settings'), {
  loading: () => (
    <div className="min-h-screen bg-[#EDF4ED] p-8">
      <div className="max-w-3xl mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
});

// HOC for lazy loading with error boundary
export function withLazyLoading<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
) {
  return dynamic(importFunc, {
    loading: fallback || (() => (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )),
    ssr: false,
  });
}

// Utility for preloading components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    // Preload on user interaction or after initial load
    requestIdleCallback || setTimeout(() => {
      importFunc();
    }, 0);
  }
};

// Intersection Observer hook for lazy loading on scroll
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
        observer.unobserve(target);
      }
    }, options);

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [callback, options]);

  return targetRef;
};

// Component lazy loading with intersection observer
export const LazyOnScroll = ({ 
  children, 
  fallback, 
  threshold = 0.1 
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  threshold?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useIntersectionObserver(
    () => setIsVisible(true),
    { threshold }
  );

  return (
    <div ref={ref}>
      {isVisible ? children : (fallback || (
        <div className="h-32 flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 w-full h-full rounded"></div>
        </div>
      ))}
    </div>
  );
}; 
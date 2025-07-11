'use client';

import { useEffect } from 'react';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Track Core Web Vitals
    const trackWebVitals = () => {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const lcp = lastEntry.startTime;
        
        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'LCP',
            value: Math.round(lcp),
            non_interaction: true,
          });
        }
        
        console.log('LCP:', lcp);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          const fid = fidEntry.processingStart - fidEntry.startTime;
          
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'FID',
              value: Math.round(fid),
              non_interaction: true,
            });
          }
          
          console.log('FID:', fid);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      let clsEntries: any[] = [];

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            clsEntries.push(entry);
          }
        });
        
        // Send CLS after 5 seconds
        setTimeout(() => {
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: 'CLS',
              value: Math.round(clsValue * 1000) / 1000,
              non_interaction: true,
            });
          }
          console.log('CLS:', clsValue);
        }, 5000);
      }).observe({ entryTypes: ['layout-shift'] });
    };

    // Track page load performance
    const trackPageLoad = () => {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType('paint');
          
          const metrics = {
            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
            tcp: navigation.connectEnd - navigation.connectStart,
            ttfb: navigation.responseStart - navigation.requestStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
          };

          // Send to analytics
          if (window.gtag) {
            window.gtag('event', 'page_performance', {
              event_category: 'Performance',
              event_label: 'Page Load',
              dns_time: Math.round(metrics.dns),
              tcp_time: Math.round(metrics.tcp),
              ttfb: Math.round(metrics.ttfb),
              dom_content_loaded: Math.round(metrics.domContentLoaded),
              load_complete: Math.round(metrics.loadComplete),
              first_paint: Math.round(metrics.firstPaint),
              first_contentful_paint: Math.round(metrics.firstContentfulPaint),
            });
          }

          console.log('Page Load Metrics:', metrics);
        }, 0);
      });
    };

    // Track resource loading performance
    const trackResourcePerformance = () => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const resource = entry as PerformanceResourceTiming;
          
          // Only track slow resources (>1s)
          if (resource.duration > 1000) {
            if (window.gtag) {
              window.gtag('event', 'slow_resource', {
                event_category: 'Performance',
                event_label: 'Slow Resource',
                resource_name: resource.name,
                resource_type: resource.initiatorType,
                duration: Math.round(resource.duration),
                size: resource.transferSize || 0,
              });
            }
            
            console.log('Slow Resource:', {
              name: resource.name,
              type: resource.initiatorType,
              duration: resource.duration,
              size: resource.transferSize,
            });
          }
        });
      }).observe({ entryTypes: ['resource'] });
    };

    // Track network conditions
    const trackNetworkConditions = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        
        if (window.gtag) {
          window.gtag('event', 'network_conditions', {
            event_category: 'Performance',
            event_label: 'Network Info',
            effective_type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            save_data: connection.saveData,
          });
        }
        
        console.log('Network Conditions:', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      }
    };

    // Initialize tracking
    trackWebVitals();
    trackPageLoad();
    trackResourcePerformance();
    trackNetworkConditions();
  }, []);

  return null;
} 
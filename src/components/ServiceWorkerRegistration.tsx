'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerSW = async () => {
        try {
          // Check if service worker is already registered
          const existingRegistration = await navigator.serviceWorker.getRegistration();

          if (existingRegistration) {
            console.log('Service Worker already registered:', existingRegistration);
            return;
          }

          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none', // Always check for updates
          });

          console.log('Service Worker registered successfully:', registration);

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });

          // Handle service worker messages
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SYNC_COMPLETE') {
              console.log('Background sync completed:', event.data.timestamp);
            }
          });

        } catch (error) {
          console.error('Service Worker registration failed:', error);

          // Don't show error to user if it's just a network issue
          if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.log('Service Worker registration skipped due to network issues');
          }
        }
      };

      registerSW();
    }
  }, []);

  return null;
} 
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Property, PropertyCategory, PropertyType } from '@prisma/client';
import PropertyCard from './properties/PropertyCard';

interface PropertyWithDetails extends Property {
  owner: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  };
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }>;
  _count: {
    images: number;
    videos: number;
    reviews: number;
    inquiries: number;
  };
}

interface VirtualizedPropertyGridProps {
  properties: PropertyWithDetails[];
  viewMode: 'grid' | 'list';
  itemsPerPage?: number;
  height?: number;
}

export default function VirtualizedPropertyGrid({
  properties,
  viewMode,
  itemsPerPage = 12,
  height = 800,
}: VirtualizedPropertyGridProps) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: itemsPerPage });
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Calculate item height based on view mode
  const getItemHeight = useCallback(() => {
    return viewMode === 'list' ? 200 : 400; // Approximate heights
  }, [viewMode]);

  // Calculate total height
  const totalHeight = properties.length * getItemHeight();

  // Handle scroll to load more items
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isLoading) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const itemHeight = getItemHeight();

    // Calculate visible range
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 2, // Add buffer
      properties.length
    );

    setVisibleRange({ start, end });
  }, [properties.length, getItemHeight, isLoading]);

  // Load more items when reaching bottom
  const loadMoreItems = useCallback(() => {
    if (isLoading) return;

    setIsLoading(true);
    
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleRange(prev => ({
        start: prev.start,
        end: Math.min(prev.end + itemsPerPage, properties.length)
      }));
      setIsLoading(false);
    }, 300);
  }, [isLoading, itemsPerPage, properties.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!containerRef.current) return;

    const options = {
      root: containerRef.current,
      rootMargin: '100px',
      threshold: 0.1,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && visibleRange.end < properties.length) {
          loadMoreItems();
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, options);

    // Observe the last visible item
    const lastVisibleItem = containerRef.current.querySelector(
      `[data-index="${visibleRange.end - 1}"]`
    );
    if (lastVisibleItem) {
      observerRef.current.observe(lastVisibleItem);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [visibleRange.end, properties.length, loadMoreItems]);

  // Handle initial scroll
  useEffect(() => {
    handleScroll();
  }, [handleScroll]);

  // Get visible properties
  const visibleProperties = properties.slice(visibleRange.start, visibleRange.end);

  // Calculate transform for virtual positioning
  const getTransform = (index: number) => {
    return `translateY(${index * getItemHeight()}px)`;
  };

  return (
    <div className="relative">
      {/* Virtual container with total height */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {/* Visible properties */}
          {visibleProperties.map((property, index) => {
            const actualIndex = visibleRange.start + index;
            return (
              <div
                key={property.id}
                data-index={actualIndex}
                className="absolute w-full"
                style={{
                  transform: getTransform(actualIndex),
                  height: getItemHeight(),
                }}
              >
                <PropertyCard property={property} viewMode={viewMode} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}

      {/* End of list indicator */}
      {visibleRange.end >= properties.length && properties.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>You've reached the end of the property list</p>
        </div>
      )}

      {/* Empty state */}
      {properties.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or check back later for new listings.</p>
        </div>
      )}
    </div>
  );
} 
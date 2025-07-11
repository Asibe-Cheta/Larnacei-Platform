'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string;
}

export default function GoogleAnalytics({ GA_MEASUREMENT_ID }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: {
              'custom_parameter_1': 'property_id',
              'custom_parameter_2': 'property_category',
              'custom_parameter_3': 'property_location'
            }
          });
          
          // Track property views
          window.trackPropertyView = function(propertyId, propertyTitle, category, location) {
            gtag('event', 'property_view', {
              property_id: propertyId,
              property_title: propertyTitle,
              property_category: category,
              property_location: location,
              event_category: 'engagement',
              event_label: 'property_view'
            });
          };
          
          // Track property inquiries
          window.trackPropertyInquiry = function(propertyId, propertyTitle, inquiryType) {
            gtag('event', 'property_inquiry', {
              property_id: propertyId,
              property_title: propertyTitle,
              inquiry_type: inquiryType,
              event_category: 'conversion',
              event_label: 'property_inquiry'
            });
          };
          
          // Track search events
          window.trackPropertySearch = function(searchTerm, filters) {
            gtag('event', 'property_search', {
              search_term: searchTerm,
              search_filters: JSON.stringify(filters),
              event_category: 'engagement',
              event_label: 'property_search'
            });
          };
          
          // Track user registration
          window.trackUserRegistration = function(userType) {
            gtag('event', 'user_registration', {
              user_type: userType,
              event_category: 'conversion',
              event_label: 'user_registration'
            });
          };
          
          // Track property listing
          window.trackPropertyListing = function(propertyType, category) {
            gtag('event', 'property_listing', {
              property_type: propertyType,
              property_category: category,
              event_category: 'conversion',
              event_label: 'property_listing'
            });
          };
        `}
      </Script>
    </>
  );
} 
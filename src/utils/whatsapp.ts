/**
 * WhatsApp Integration Utilities
 * Handles WhatsApp deep-linking and message formatting for the Nigerian market
 */

export interface WhatsAppMessageData {
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice: number;
  propertyCurrency: string;
  inquirerName: string;
  inquirerPhone: string;
  inquiryType: string;
  message: string;
  propertyUrl: string;
}

export interface WhatsAppTemplateData {
  template: string;
  variables: Record<string, string>;
}

/**
 * Generate WhatsApp message based on inquiry type
 */
export const generateWhatsAppMessage = (data: WhatsAppMessageData): string => {
  const price = formatPrice(data.propertyPrice, data.propertyCurrency);
  
  switch (data.inquiryType) {
    case 'VIEWING_REQUEST':
      return `Hello! I'm ${data.inquirerName} and I'd like to schedule a viewing for your property: ${data.propertyTitle} located in ${data.propertyLocation}. Price: ${price}. When would be convenient? - Sent via Larnacei\n\nProperty Link: ${data.propertyUrl}`;
    
    case 'PRICE_INQUIRY':
      return `Hi! I'm ${data.inquirerName} and I'm interested in ${data.propertyTitle}. Is the price of ${price} negotiable? Looking forward to hearing from you. - Sent via Larnacei\n\nProperty Link: ${data.propertyUrl}`;
    
    case 'PURCHASE_INTENT':
      return `Hello! I'm ${data.inquirerName} and I'm seriously interested in purchasing ${data.propertyTitle} in ${data.propertyLocation}. Price: ${price}. Could you provide more details about the purchase process? - Sent via Larnacei\n\nProperty Link: ${data.propertyUrl}`;
    
    case 'RENTAL_APPLICATION':
      return `Hi! I'm ${data.inquirerName} and I'm interested in renting ${data.propertyTitle} in ${data.propertyLocation}. Price: ${price}. Could you provide information about the rental application process? - Sent via Larnacei\n\nProperty Link: ${data.propertyUrl}`;
    
    case 'INVESTMENT_INQUIRY':
      return `Hello! I'm ${data.inquirerName} and I'm interested in ${data.propertyTitle} as an investment opportunity. Price: ${price}. Could you provide information about rental yields and investment potential? - Sent via Larnacei\n\nProperty Link: ${data.propertyUrl}`;
    
    default:
      return `Hi! I'm ${data.inquirerName} and I'm interested in your property: ${data.propertyTitle} located in ${data.propertyLocation}. Price: ${price}. Could you provide more information? - Sent via Larnacei\n\nProperty Link: ${data.propertyUrl}`;
  }
};

/**
 * Generate WhatsApp URL with pre-filled message
 */
export const generateWhatsAppUrl = (phoneNumber: string, message: string): string => {
  // Clean phone number (remove spaces, dashes, etc.)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Ensure it starts with country code
  let formattedPhone = cleanPhone;
  if (cleanPhone.startsWith('0')) {
    formattedPhone = '234' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('234')) {
    formattedPhone = '234' + cleanPhone;
  }
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

/**
 * Open WhatsApp with pre-filled message
 */
export const openWhatsApp = (phoneNumber: string, message: string): void => {
  const whatsappUrl = generateWhatsAppUrl(phoneNumber, message);
  window.open(whatsappUrl, '_blank');
};

/**
 * Check if WhatsApp is available on the device
 */
export const isWhatsAppAvailable = (): boolean => {
  // Check if it's a mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // For mobile devices, assume WhatsApp is available
  // For desktop, assume WhatsApp Web is available
  return true;
};

/**
 * Generate WhatsApp business message templates
 */
export const getWhatsAppTemplates = (): WhatsAppTemplateData[] => [
  {
    template: "Hi! I'm interested in your property: {propertyTitle} located in {location}. Price: {price}. Could you provide more information?",
    variables: {
      propertyTitle: "Property Title",
      location: "Location",
      price: "Price"
    }
  },
  {
    template: "Hello! I'd like to schedule a viewing for your property: {propertyTitle} in {location}. When would be convenient?",
    variables: {
      propertyTitle: "Property Title",
      location: "Location"
    }
  },
  {
    template: "Hi! I'm interested in {propertyTitle}. Is the price of {price} negotiable? Looking forward to hearing from you.",
    variables: {
      propertyTitle: "Property Title",
      price: "Price"
    }
  },
  {
    template: "Hello! I'm seriously interested in purchasing {propertyTitle} in {location}. Could you provide more details about the purchase process?",
    variables: {
      propertyTitle: "Property Title",
      location: "Location"
    }
  },
  {
    template: "Hi! I'm interested in renting {propertyTitle} in {location}. Could you provide information about the rental application process?",
    variables: {
      propertyTitle: "Property Title",
      location: "Location"
    }
  }
];

/**
 * Format price for WhatsApp messages
 */
const formatPrice = (price: number, currency: string): string => {
  const amount = price / 100; // Convert from kobo to naira
  
  if (currency === 'NGN') {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    } else {
      return `₦${amount.toLocaleString()}`;
    }
  }
  
  return `${currency} ${amount.toLocaleString()}`;
};

/**
 * Generate quick reply buttons for WhatsApp
 */
export const generateQuickReplies = (propertyTitle: string, propertyLocation: string) => [
  {
    text: `I'm interested in ${propertyTitle}`,
    action: 'interest'
  },
  {
    text: `Schedule viewing for ${propertyTitle}`,
    action: 'viewing'
  },
  {
    text: `Price negotiation for ${propertyTitle}`,
    action: 'price'
  },
  {
    text: `More details about ${propertyLocation}`,
    action: 'details'
  }
];

/**
 * Handle WhatsApp fallback if not available
 */
export const handleWhatsAppFallback = (phoneNumber: string, message: string): void => {
  if (isWhatsAppAvailable()) {
    openWhatsApp(phoneNumber, message);
  } else {
    // Fallback to SMS or email
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  }
}; 
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English translations
const en = {
  common: {
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    close: 'Close',
    open: 'Open',
    yes: 'Yes',
    no: 'No',
    ok: 'OK'
  },
  navigation: {
    home: 'Home',
    properties: 'Properties',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout'
  },
  property: {
    title: 'Property',
    properties: 'Properties',
    search: 'Search Properties',
    filter: 'Filter Properties',
    sort: 'Sort Properties',
    view: 'View Property',
    details: 'Property Details',
    location: 'Location',
    price: 'Price',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    size: 'Size',
    type: 'Property Type',
    status: 'Status',
    amenities: 'Amenities',
    description: 'Description',
    features: 'Features',
    images: 'Images',
    contact: 'Contact Owner',
    inquire: 'Inquire',
    viewOnMap: 'View on Map',
    share: 'Share',
    save: 'Save Property',
    similar: 'Similar Properties',
    nearby: 'Nearby Properties'
  },
  forms: {
    title: 'Title',
    description: 'Description',
    location: 'Location',
    address: 'Address',
    city: 'City',
    state: 'State',
    price: 'Price',
    currency: 'Currency',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    size: 'Size (sq ft)',
    propertyType: 'Property Type',
    status: 'Status',
    amenities: 'Amenities',
    images: 'Images',
    contactInfo: 'Contact Information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    message: 'Message',
    submit: 'Submit',
    reset: 'Reset Form'
  },
  messages: {
    welcome: 'Welcome to Larnacei',
    searchPlaceholder: 'Search for properties...',
    noResults: 'No properties found',
    loading: 'Loading properties...',
    error: 'An error occurred',
    success: 'Operation completed successfully',
    confirmDelete: 'Are you sure you want to delete this item?',
    saved: 'Item saved successfully',
    deleted: 'Item deleted successfully',
    updated: 'Item updated successfully'
  },
  currency: {
    naira: '₦',
    dollar: '$',
    pound: '£',
    euro: '€'
  },
  date: {
    format: 'MM/DD/YYYY',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow'
  }
};

// Pidgin English translations
const pcm = {
  common: {
    search: 'Find',
    filter: 'Filter',
    sort: 'Arrange',
    view: 'See',
    edit: 'Change',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Dey load...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    back: 'Go back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    close: 'Close',
    open: 'Open',
    yes: 'Yes',
    no: 'No',
    ok: 'OK'
  },
  navigation: {
    home: 'Home',
    properties: 'Properties',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout'
  },
  property: {
    title: 'Property',
    properties: 'Properties',
    search: 'Find Properties',
    filter: 'Filter Properties',
    sort: 'Arrange Properties',
    view: 'See Property',
    details: 'Property Details',
    location: 'Location',
    price: 'Price',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    size: 'Size',
    type: 'Property Type',
    status: 'Status',
    amenities: 'Amenities',
    description: 'Description',
    features: 'Features',
    images: 'Images',
    contact: 'Contact Owner',
    inquire: 'Ask about',
    viewOnMap: 'See on Map',
    share: 'Share',
    save: 'Save Property',
    similar: 'Similar Properties',
    nearby: 'Properties Wey Near'
  },
  forms: {
    title: 'Title',
    description: 'Description',
    location: 'Location',
    address: 'Address',
    city: 'City',
    state: 'State',
    price: 'Price',
    currency: 'Currency',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    size: 'Size (sq ft)',
    propertyType: 'Property Type',
    status: 'Status',
    amenities: 'Amenities',
    images: 'Images',
    contactInfo: 'Contact Information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    message: 'Message',
    submit: 'Submit',
    reset: 'Reset Form'
  },
  messages: {
    welcome: 'Welcome to Larnacei',
    searchPlaceholder: 'Find properties...',
    noResults: 'No properties find',
    loading: 'Dey load properties...',
    error: 'Something go wrong',
    success: 'Operation successful',
    confirmDelete: 'You sure say you wan delete this thing?',
    saved: 'Thing don save',
    deleted: 'Thing don delete',
    updated: 'Thing don update'
  },
  currency: {
    naira: '₦',
    dollar: '$',
    pound: '£',
    euro: '€'
  },
  date: {
    format: 'MM/DD/YYYY',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow'
  }
};

// Hausa translations
const ha = {
  common: {
    search: 'Nema',
    filter: 'Tace',
    sort: 'Tsara',
    view: 'Duba',
    edit: 'Gyara',
    delete: 'Share',
    save: 'Ajiye',
    cancel: 'Soke',
    loading: 'Ana loading...',
    error: 'Kuskure',
    success: 'Nasara',
    confirm: 'Tabbatar',
    back: 'Komawa',
    next: 'Na gaba',
    previous: 'Na baya',
    submit: 'Aika',
    reset: 'Sake saita',
    close: 'Rufe',
    open: 'Bude',
    yes: 'Ee',
    no: 'A\'a',
    ok: 'Ok'
  },
  navigation: {
    home: 'Gida',
    properties: 'Dukiyoyi',
    about: 'Game da',
    contact: 'Tuntuɓi',
    login: 'Shiga',
    register: 'Rajista',
    dashboard: 'Dashboard',
    profile: 'Bayanin mutum',
    settings: 'Saiti',
    logout: 'Fita'
  },
  property: {
    title: 'Dukiya',
    properties: 'Dukiyoyi',
    search: 'Nemi Dukiyoyi',
    filter: 'Tace Dukiyoyi',
    sort: 'Tsara Dukiyoyi',
    view: 'Duba Dukiya',
    details: 'Bayanin Dukiya',
    location: 'Wuri',
    price: 'Farashi',
    bedrooms: 'Dakunan kwana',
    bathrooms: 'Dakunan wanka',
    size: 'Girma',
    type: 'Nau\'in Dukiya',
    status: 'Matsayi',
    amenities: 'Abubuwan da ake da su',
    description: 'Bayani',
    features: 'Siffofi',
    images: 'Hotuna',
    contact: 'Tuntuɓi Mai shi',
    inquire: 'Tambayi game da',
    viewOnMap: 'Duba akan Taswira',
    share: 'Raba',
    save: 'Ajiye Dukiya',
    similar: 'Dukiyoyi masu kama',
    nearby: 'Dukiyoyi masu kusa'
  },
  forms: {
    title: 'Take',
    description: 'Bayani',
    location: 'Wuri',
    address: 'Adireshi',
    city: 'Birni',
    state: 'Jiha',
    price: 'Farashi',
    currency: 'Kuɗi',
    bedrooms: 'Dakunan kwana',
    bathrooms: 'Dakunan wanka',
    size: 'Girma (sq ft)',
    propertyType: 'Nau\'in Dukiya',
    status: 'Matsayi',
    amenities: 'Abubuwan da ake da su',
    images: 'Hotuna',
    contactInfo: 'Bayanin Tuntuɓi',
    name: 'Suna',
    email: 'Email',
    phone: 'Wayar hannu',
    message: 'Sako',
    submit: 'Aika',
    reset: 'Sake saita Form'
  },
  messages: {
    welcome: 'Barka da zuwa Larnacei',
    searchPlaceholder: 'Nemi dukiyoyi...',
    noResults: 'Ba a sami dukiyoyi ba',
    loading: 'Ana loading dukiyoyi...',
    error: 'An sami kuskure',
    success: 'Aikin ya yi nasara',
    confirmDelete: 'Kuna da tabbacin cewa kuna son share wannan abu?',
    saved: 'Abu ya ajiye',
    deleted: 'Abu ya share',
    updated: 'Abu ya update'
  },
  currency: {
    naira: '₦',
    dollar: '$',
    pound: '£',
    euro: '€'
  },
  date: {
    format: 'MM/DD/YYYY',
    today: 'Yau',
    yesterday: 'Jiya',
    tomorrow: 'Gobe'
  }
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en
      },
      pcm: {
        translation: pcm
      },
      ha: {
        translation: ha
      }
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

// Language detection and switching
export const detectLanguage = (): string => {
  // Check localStorage first
  const savedLang = localStorage.getItem('larnacei-language');
  if (savedLang && ['en', 'pcm', 'ha'].includes(savedLang)) {
    return savedLang;
  }

  // Check browser language
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  
  if (browserLang.startsWith('ha')) {
    return 'ha';
  }
  
  // For Nigerian users, default to Pidgin if no specific preference
  if (browserLang.startsWith('en')) {
    // Check if user is in Nigeria (you might want to use IP geolocation)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('Africa/Lagos') || timezone.includes('Africa/Abuja')) {
      return 'pcm';
    }
  }
  
  return 'en';
};

export const setLanguage = (language: string) => {
  localStorage.setItem('larnacei-language', language);
  i18n.changeLanguage(language);
  
  // Update document direction for RTL languages if needed
  document.documentElement.dir = language === 'ha' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

export const getCurrentLanguage = (): string => {
  return i18n.language;
};

export const getAvailableLanguages = () => [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pcm', name: 'Pidgin English', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', flag: '🇳🇬' }
];

// Currency formatting for Nigerian market
export const formatCurrency = (amount: number, currency: string = 'NGN', language: string = 'en'): string => {
  const formatter = new Intl.NumberFormat(language === 'ha' ? 'ar-NG' : 'en-NG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(amount);
};

// Date formatting for Nigerian market
export const formatDate = (date: Date, language: string = 'en'): string => {
  const formatter = new Intl.DateTimeFormat(language === 'ha' ? 'ar-NG' : 'en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return formatter.format(date);
};

// Number formatting for Nigerian market
export const formatNumber = (number: number, language: string = 'en'): string => {
  const formatter = new Intl.NumberFormat(language === 'ha' ? 'ar-NG' : 'en-NG');
  return formatter.format(number);
};

// Initialize with detected language
const detectedLang = detectLanguage();
setLanguage(detectedLang);

export default i18n; 
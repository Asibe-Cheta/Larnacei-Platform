'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, MapPin, Home, TrendingUp, Save, Share2, Calculator } from 'lucide-react';

interface SearchFilters {
  location: string;
  propertyType: string[];
  priceRange: { min: number; max: number };
  bedrooms: number[];
  bathrooms: number[];
  amenities: string[];
  keywords: string;
  radius: number;
  sortBy: 'price' | 'date' | 'relevance' | 'popularity';
}

interface SearchSuggestion {
  text: string;
  type: 'location' | 'property' | 'amenity' | 'keyword';
  relevance: number;
}

interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
  resultCount: number;
}

export default function AdvancedSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    propertyType: [],
    priceRange: { min: 0, max: 100000000 },
    bedrooms: [],
    bathrooms: [],
    amenities: [],
    keywords: '',
    radius: 10,
    sortBy: 'relevance'
  });
  
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Property types for Nigerian market
  const propertyTypes = [
    'Apartment', 'House', 'Villa', 'Duplex', 'Penthouse', 'Studio',
    'Commercial', 'Office', 'Shop', 'Warehouse', 'Land', 'Farm'
  ];

  // Popular amenities in Nigeria
  const amenities = [
    'Air Conditioning', 'Generator', 'Security', 'Parking', 'Garden',
    'Swimming Pool', 'Gym', 'WiFi', 'Kitchen', 'Laundry', 'Furnished',
    'Pet Friendly', 'Elevator', 'Doorman', 'Storage', 'Terrace',
    'Fireplace', 'Central Heating', 'Dishwasher', 'Microwave',
    'Refrigerator', 'Washing Machine', 'Dryer', 'Cable TV', 'Internet'
  ];

  // Nigerian locations
  const nigerianLocations = [
    'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Kaduna', 'Port Harcourt',
    'Maiduguri', 'Zaria', 'Aba', 'Jos', 'Ilorin', 'Oyo', 'Enugu',
    'Abeokuta', 'Sokoto', 'Onitsha', 'Warri', 'Calabar', 'Uyo',
    'Lekki', 'Victoria Island', 'Ikeja', 'Surulere', 'Yaba'
  ];

  // Generate AI-powered search suggestions
  const generateSuggestions = (query: string): SearchSuggestion[] => {
    if (!query.trim()) return [];

    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Location suggestions
    nigerianLocations.forEach(location => {
      if (location.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: location,
          type: 'location',
          relevance: location.toLowerCase().startsWith(lowerQuery) ? 0.9 : 0.7
        });
      }
    });

    // Property type suggestions
    propertyTypes.forEach(type => {
      if (type.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: type,
          type: 'property',
          relevance: type.toLowerCase().startsWith(lowerQuery) ? 0.8 : 0.6
        });
      }
    });

    // Amenity suggestions
    amenities.forEach(amenity => {
      if (amenity.toLowerCase().includes(lowerQuery)) {
        suggestions.push({
          text: amenity,
          type: 'amenity',
          relevance: amenity.toLowerCase().startsWith(lowerQuery) ? 0.7 : 0.5
        });
      }
    });

    // Natural language processing for common queries
    const naturalLanguagePatterns = [
      { pattern: /(\d+)\s*(bedroom|bed)/i, suggestion: '$1 Bedroom' },
      { pattern: /(\d+)\s*(bathroom|bath)/i, suggestion: '$1 Bathroom' },
      { pattern: /(luxury|premium|high-end)/i, suggestion: 'Luxury Property' },
      { pattern: /(affordable|cheap|budget)/i, suggestion: 'Affordable Housing' },
      { pattern: /(investment|rental|income)/i, suggestion: 'Investment Property' },
      { pattern: /(family|residential)/i, suggestion: 'Family Home' },
      { pattern: /(studio|1\s*bed)/i, suggestion: 'Studio Apartment' },
      { pattern: /(penthouse|duplex)/i, suggestion: 'Penthouse' }
    ];

    naturalLanguagePatterns.forEach(({ pattern, suggestion }) => {
      if (pattern.test(query)) {
        suggestions.push({
          text: suggestion,
          type: 'keyword',
          relevance: 0.8
        });
      }
    });

    // Sort by relevance and return top 10
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  };

  // Handle search input changes
  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setSuggestions([]);
    
    // Update filters based on suggestion type
    if (suggestion.type === 'location') {
      setFilters(prev => ({ ...prev, location: suggestion.text }));
    } else if (suggestion.type === 'property') {
      setFilters(prev => ({ 
        ...prev, 
        propertyType: [...prev.propertyType, suggestion.text]
      }));
    } else if (suggestion.type === 'amenity') {
      setFilters(prev => ({ 
        ...prev, 
        amenities: [...prev.amenities, suggestion.text]
      }));
    }
  };

  // Perform search
  const performSearch = async () => {
    setIsSearching(true);
    
    // Add to search history
    if (searchQuery.trim()) {
      setSearchHistory(prev => {
        const newHistory = [searchQuery, ...prev.filter(item => item !== searchQuery)];
        return newHistory.slice(0, 10); // Keep last 10 searches
      });
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would call your search API
    console.log('Searching with filters:', { searchQuery, filters });
    
    setIsSearching(false);
  };

  // Save current search
  const saveSearch = () => {
    const newSavedSearch: SavedSearch = {
      id: Date.now().toString(),
      name: `Search ${savedSearches.length + 1}`,
      filters: { ...filters },
      createdAt: new Date(),
      resultCount: Math.floor(Math.random() * 100) + 10
    };
    
    setSavedSearches(prev => [...prev, newSavedSearch]);
  };

  // Load saved search
  const loadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
    setSearchQuery(savedSearch.name);
  };

  // Share search
  const shareSearch = () => {
    const searchParams = new URLSearchParams({
      q: searchQuery,
      location: filters.location,
      type: filters.propertyType.join(','),
      price_min: filters.priceRange.min.toString(),
      price_max: filters.priceRange.max.toString(),
      bedrooms: filters.bedrooms.join(','),
      amenities: filters.amenities.join(',')
    });
    
    const shareUrl = `${window.location.origin}/properties?${searchParams.toString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Property Search',
        text: `Check out these properties: ${searchQuery}`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Search URL copied to clipboard!');
    }
  };

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              placeholder="Search properties with natural language... (e.g., '3 bedroom apartment in Lekki with pool')"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      suggestion.type === 'location' ? 'bg-blue-500' :
                      suggestion.type === 'property' ? 'bg-green-500' :
                      suggestion.type === 'amenity' ? 'bg-orange-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-gray-700">{suggestion.text}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {suggestion.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-red-600 text-white border-red-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-5 w-5" />
          </button>
          
          <button
            onClick={performSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Search</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={saveSearch}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600"
            >
              <Save className="h-4 w-4" />
              <span>Save Search</span>
            </button>
            
            <button
              onClick={shareSearch}
              className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
          
          <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600">
            <Calculator className="h-4 w-4" />
            <span>Mortgage Calculator</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
              <div className="grid grid-cols-2 gap-2">
                {propertyTypes.slice(0, 8).map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.propertyType.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ 
                            ...prev, 
                            propertyType: [...prev.propertyType, type]
                          }));
                        } else {
                          setFilters(prev => ({ 
                            ...prev, 
                            propertyType: prev.propertyType.filter(t => t !== type)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range (₦)</label>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min price"
                  value={filters.priceRange.min || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
                <input
                  type="number"
                  placeholder="Max price"
                  value={filters.priceRange.max || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, '6+'].map(num => (
                  <button
                    key={num}
                    onClick={() => {
                      if (filters.bedrooms.includes(num as number)) {
                        setFilters(prev => ({ 
                          ...prev, 
                          bedrooms: prev.bedrooms.filter(b => b !== num)
                        }));
                      } else {
                        setFilters(prev => ({ 
                          ...prev, 
                          bedrooms: [...prev.bedrooms, num as number]
                        }));
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm ${
                      filters.bedrooms.includes(num as number)
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {amenities.slice(0, 10).map(amenity => (
                  <label key={amenity} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({ 
                            ...prev, 
                            amenities: [...prev.amenities, amenity]
                          }));
                        } else {
                          setFilters(prev => ({ 
                            ...prev, 
                            amenities: prev.amenities.filter(a => a !== amenity)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  sortBy: e.target.value as 'price' | 'date' | 'relevance' | 'popularity'
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="relevance">Relevance</option>
                <option value="price">Price</option>
                <option value="date">Date Added</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Searches</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedSearches.map(search => (
              <div
                key={search.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-red-300 cursor-pointer"
                onClick={() => loadSavedSearch(search)}
              >
                <h4 className="font-medium text-gray-900">{search.name}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {search.filters.location && `${search.filters.location} • `}
                  {search.filters.propertyType.length > 0 && `${search.filters.propertyType.join(', ')} • `}
                  {search.resultCount} results
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {search.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((search, index) => (
              <button
                key={index}
                onClick={() => setSearchQuery(search)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-red-100 hover:text-red-700"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
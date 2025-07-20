import { prisma } from './prisma';
import { cacheManager } from './redis';

// AI Search interfaces
export interface SearchQuery {
  originalQuery: string;
  processedQuery: string;
  intent: SearchIntent;
  entities: SearchEntity[];
  filters: SearchFilters;
  confidence: number;
}

export interface SearchIntent {
  type: 'buy' | 'rent' | 'short_stay' | 'invest' | 'explore';
  confidence: number;
  modifiers: string[];
}

export interface SearchEntity {
  type: 'location' | 'property_type' | 'price' | 'bedrooms' | 'amenity' | 'timeframe';
  value: string;
  confidence: number;
  normalizedValue?: string;
}

export interface SearchFilters {
  locations: string[];
  propertyTypes: string[];
  priceRange: { min: number; max: number };
  bedrooms: number[];
  amenities: string[];
  timeframes: string[];
  keywords: string[];
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'location' | 'property_type';
  relevance: number;
  description?: string;
}

export interface SemanticSearchResult {
  propertyId: string;
  relevanceScore: number;
  matchingFeatures: string[];
  explanation: string;
}

export class AISearchService {
  // Nigerian property market patterns
  private readonly NIGERIAN_LOCATIONS = [
    'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Kaduna', 'Port Harcourt',
    'Maiduguri', 'Zaria', 'Aba', 'Jos', 'Ilorin', 'Oyo', 'Enugu',
    'Abeokuta', 'Sokoto', 'Onitsha', 'Warri', 'Calabar', 'Uyo',
    'Lekki', 'Victoria Island', 'Ikeja', 'Surulere', 'Yaba',
    'Gbagada', 'Magodo', 'Banana Island', 'Ikoyi', 'Maryland'
  ];

  private readonly PROPERTY_TYPES = [
    'apartment', 'house', 'villa', 'duplex', 'penthouse', 'studio',
    'commercial', 'office', 'shop', 'warehouse', 'land', 'farm'
  ];

  private readonly AMENITIES = [
    'air conditioning', 'generator', 'security', 'parking', 'garden',
    'swimming pool', 'gym', 'wifi', 'kitchen', 'laundry', 'furnished',
    'pet friendly', 'elevator', 'doorman', 'storage', 'terrace'
  ];

  private readonly INTENT_PATTERNS = {
    buy: ['buy', 'purchase', 'own', 'investment', 'buying'],
    rent: ['rent', 'lease', 'rental', 'renting', 'monthly'],
    short_stay: ['short stay', 'vacation', 'temporary', 'holiday', 'airbnb'],
    invest: ['investment', 'roi', 'yield', 'income', 'profit'],
    explore: ['browse', 'view', 'look', 'search', 'find']
  };

  // Process natural language search query
  async processSearchQuery(query: string): Promise<SearchQuery> {
    const cacheKey = `ai:search:${query.toLowerCase()}`;
    
    // Try cache first
    const cached = await cacheManager.getSearchResults(cacheKey);
    if (cached) return cached;

    const processedQuery = this.normalizeQuery(query);
    const intent = this.detectIntent(processedQuery);
    const entities = this.extractEntities(processedQuery);
    const filters = this.buildFilters(entities, intent);
    const confidence = this.calculateConfidence(intent, entities);

    const searchQuery: SearchQuery = {
      originalQuery: query,
      processedQuery,
      intent,
      entities,
      filters,
      confidence
    };

    // Cache the processed query
    await cacheManager.setSearchResults(cacheKey, searchQuery);

    return searchQuery;
  }

  // Generate intelligent search suggestions
  async generateSearchSuggestions(
    partialQuery: string, 
    userHistory?: string[]
  ): Promise<SearchSuggestion[]> {
    const suggestions: SearchSuggestion[] = [];

    // Location suggestions
    const locationSuggestions = this.NIGERIAN_LOCATIONS
      .filter(location => 
        location.toLowerCase().includes(partialQuery.toLowerCase())
      )
      .map(location => ({
        text: location,
        type: 'location' as const,
        relevance: location.toLowerCase().startsWith(partialQuery.toLowerCase()) ? 0.9 : 0.7,
        description: `Properties in ${location}`
      }));

    // Property type suggestions
    const typeSuggestions = this.PROPERTY_TYPES
      .filter(type => 
        type.toLowerCase().includes(partialQuery.toLowerCase())
      )
      .map(type => ({
        text: type,
        type: 'property_type' as const,
        relevance: type.toLowerCase().startsWith(partialQuery.toLowerCase()) ? 0.8 : 0.6,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} properties`
      }));

    // Natural language patterns
    const naturalLanguageSuggestions = this.generateNaturalLanguageSuggestions(partialQuery);

    // User history suggestions
    const historySuggestions = userHistory
      ?.filter(history => 
        history.toLowerCase().includes(partialQuery.toLowerCase())
      )
      .map(history => ({
        text: history,
        type: 'query' as const,
        relevance: 0.8,
        description: 'From your search history'
      })) || [];

    // Combine and sort suggestions
    suggestions.push(
      ...locationSuggestions,
      ...typeSuggestions,
      ...naturalLanguageSuggestions,
      ...historySuggestions
    );

    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);
  }

  // Perform semantic search
  async performSemanticSearch(
    query: SearchQuery, 
    limit: number = 20
  ): Promise<SemanticSearchResult[]> {
    const cacheKey = `semantic:search:${JSON.stringify(query)}`;
    
    // Try cache first
    const cached = await cacheManager.getSearchResults(cacheKey);
    if (cached) return cached;

    // Get properties based on filters
    const properties = await this.getPropertiesByFilters(query.filters);

    // Calculate semantic relevance scores
    const results = properties
      .map(property => this.calculateSemanticRelevance(property, query))
      .filter(result => result.relevanceScore > 0.3)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    // Cache results
    await cacheManager.setSearchResults(cacheKey, results);

    return results;
  }

  // Understand search context and improve results
  async enhanceSearchWithContext(
    query: SearchQuery,
    userBehavior?: {
      previousSearches: string[];
      savedProperties: string[];
      clickedProperties: string[];
    }
  ): Promise<SearchQuery> {
    let enhancedQuery = { ...query };

    // Adjust based on user behavior
    if (userBehavior) {
      // Learn from previous searches
      const commonPatterns = this.analyzeSearchPatterns(userBehavior.previousSearches);
      enhancedQuery.filters = this.mergeFilters(enhancedQuery.filters, commonPatterns);

      // Consider saved properties preferences
      if (userBehavior.savedProperties.length > 0) {
        const savedPreferences = await this.analyzeSavedProperties(userBehavior.savedProperties);
        enhancedQuery.filters = this.mergeFilters(enhancedQuery.filters, savedPreferences);
      }

      // Adjust confidence based on user engagement
      if (userBehavior.clickedProperties.length > 0) {
        enhancedQuery.confidence = Math.min(enhancedQuery.confidence * 1.2, 1.0);
      }
    }

    // Nigerian market context
    enhancedQuery = this.applyNigerianMarketContext(enhancedQuery);

    return enhancedQuery;
  }

  // Helper methods
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private detectIntent(query: string): SearchIntent {
    let bestIntent = { type: 'explore' as const, confidence: 0.5, modifiers: [] };
    
    for (const [intentType, patterns] of Object.entries(this.INTENT_PATTERNS)) {
      const matches = patterns.filter(pattern => query.includes(pattern));
      if (matches.length > 0) {
        const confidence = matches.length / patterns.length;
        if (confidence > bestIntent.confidence) {
          bestIntent = {
            type: intentType as any,
            confidence,
            modifiers: matches
          };
        }
      }
    }

    return bestIntent;
  }

  private extractEntities(query: string): SearchEntity[] {
    const entities: SearchEntity[] = [];

    // Extract locations
    this.NIGERIAN_LOCATIONS.forEach(location => {
      if (query.includes(location.toLowerCase())) {
        entities.push({
          type: 'location',
          value: location,
          confidence: 0.9,
          normalizedValue: location.toLowerCase()
        });
      }
    });

    // Extract property types
    this.PROPERTY_TYPES.forEach(type => {
      if (query.includes(type)) {
        entities.push({
          type: 'property_type',
          value: type,
          confidence: 0.8,
          normalizedValue: type
        });
      }
    });

    // Extract price information
    const priceMatches = query.match(/(\d+)\s*(million|m|thousand|k|naira|₦)/gi);
    if (priceMatches) {
      priceMatches.forEach(match => {
        const value = this.parsePrice(match);
        entities.push({
          type: 'price',
          value: match,
          confidence: 0.7,
          normalizedValue: value.toString()
        });
      });
    }

    // Extract bedroom information
    const bedroomMatches = query.match(/(\d+)\s*(bedroom|bed)/gi);
    if (bedroomMatches) {
      bedroomMatches.forEach(match => {
        const bedrooms = parseInt(match.match(/\d+/)?.[0] || '0');
        entities.push({
          type: 'bedrooms',
          value: match,
          confidence: 0.8,
          normalizedValue: bedrooms.toString()
        });
      });
    }

    // Extract amenities
    this.AMENITIES.forEach(amenity => {
      if (query.includes(amenity)) {
        entities.push({
          type: 'amenity',
          value: amenity,
          confidence: 0.6,
          normalizedValue: amenity
        });
      }
    });

    // Extract timeframes
    const timeframePatterns = [
      { pattern: /(immediate|now|urgent)/gi, value: 'immediate' },
      { pattern: /(next\s*month|in\s*a\s*month)/gi, value: 'next_month' },
      { pattern: /(this\s*year|2024)/gi, value: 'this_year' }
    ];

    timeframePatterns.forEach(({ pattern, value }) => {
      if (pattern.test(query)) {
        entities.push({
          type: 'timeframe',
          value: value,
          confidence: 0.7,
          normalizedValue: value
        });
      }
    });

    return entities;
  }

  private buildFilters(entities: SearchEntity[], intent: SearchIntent): SearchFilters {
    const filters: SearchFilters = {
      locations: [],
      propertyTypes: [],
      priceRange: { min: 0, max: 100000000 },
      bedrooms: [],
      amenities: [],
      timeframes: [],
      keywords: []
    };

    entities.forEach(entity => {
      switch (entity.type) {
        case 'location':
          filters.locations.push(entity.value);
          break;
        case 'property_type':
          filters.propertyTypes.push(entity.value);
          break;
        case 'price':
          const price = parseInt(entity.normalizedValue || '0');
          if (price > 0) {
            filters.priceRange = {
              min: Math.max(price * 0.8, 10000000),
              max: Math.min(price * 1.2, 200000000)
            };
          }
          break;
        case 'bedrooms':
          const bedrooms = parseInt(entity.normalizedValue || '0');
          if (bedrooms > 0) {
            filters.bedrooms.push(bedrooms);
          }
          break;
        case 'amenity':
          filters.amenities.push(entity.value);
          break;
        case 'timeframe':
          filters.timeframes.push(entity.value);
          break;
      }
    });

    // Set default property type based on intent
    if (filters.propertyTypes.length === 0) {
      switch (intent.type) {
        case 'buy':
          filters.propertyTypes = ['house', 'apartment', 'villa'];
          break;
        case 'rent':
          filters.propertyTypes = ['apartment', 'house'];
          break;
        case 'short_stay':
          filters.propertyTypes = ['apartment', 'house'];
          break;
        case 'invest':
          filters.propertyTypes = ['commercial', 'land', 'apartment'];
          break;
      }
    }

    return filters;
  }

  private calculateConfidence(intent: SearchIntent, entities: SearchEntity[]): number {
    let confidence = intent.confidence;

    // Boost confidence based on entity count
    confidence += Math.min(entities.length * 0.1, 0.3);

    // Boost confidence for specific entity types
    const hasLocation = entities.some(e => e.type === 'location');
    const hasPropertyType = entities.some(e => e.type === 'property_type');
    const hasPrice = entities.some(e => e.type === 'price');

    if (hasLocation) confidence += 0.2;
    if (hasPropertyType) confidence += 0.15;
    if (hasPrice) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private generateNaturalLanguageSuggestions(query: string): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];

    // Common Nigerian property search patterns
    const patterns = [
      { pattern: /(\d+)\s*bed/i, suggestion: '$1 Bedroom Apartment' },
      { pattern: /luxury/i, suggestion: 'Luxury Properties' },
      { pattern: /affordable/i, suggestion: 'Affordable Housing' },
      { pattern: /investment/i, suggestion: 'Investment Properties' },
      { pattern: /family/i, suggestion: 'Family Homes' },
      { pattern: /studio/i, suggestion: 'Studio Apartments' },
      { pattern: /penthouse/i, suggestion: 'Penthouse' },
      { pattern: /commercial/i, suggestion: 'Commercial Properties' }
    ];

    patterns.forEach(({ pattern, suggestion }) => {
      if (pattern.test(query)) {
        suggestions.push({
          text: suggestion,
          type: 'query',
          relevance: 0.8,
          description: 'Based on your search'
        });
      }
    });

    return suggestions;
  }

  private async getPropertiesByFilters(filters: SearchFilters) {
    const where: any = {
      isActive: true,
      moderationStatus: 'APPROVED'
    };

    if (filters.locations.length > 0) {
      where.OR = filters.locations.map(location => ({
        OR: [
          { location: { contains: location, mode: 'insensitive' } },
          { city: { contains: location, mode: 'insensitive' } },
          { state: { contains: location, mode: 'insensitive' } }
        ]
      }));
    }

    if (filters.propertyTypes.length > 0) {
      where.category = { in: filters.propertyTypes.map(type => type.toUpperCase()) };
    }

    if (filters.priceRange.min > 0 || filters.priceRange.max < 100000000) {
      where.price = {};
      if (filters.priceRange.min > 0) where.price.gte = filters.priceRange.min;
      if (filters.priceRange.max < 100000000) where.price.lte = filters.priceRange.max;
    }

    if (filters.bedrooms.length > 0) {
      where.bedrooms = { in: filters.bedrooms };
    }

    return await prisma.property.findMany({
      where,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        owner: { select: { name: true, isVerified: true } }
      }
    });
  }

  private calculateSemanticRelevance(property: any, query: SearchQuery): SemanticSearchResult {
    let score = 0;
    const matchingFeatures: string[] = [];

    // Location match
    if (query.filters.locations.some(location => 
      property.location.toLowerCase().includes(location.toLowerCase()) ||
      property.city.toLowerCase().includes(location.toLowerCase())
    )) {
      score += 0.4;
      matchingFeatures.push('Location match');
    }

    // Property type match
    if (query.filters.propertyTypes.some(type => 
      property.category.toLowerCase() === type.toLowerCase()
    )) {
      score += 0.3;
      matchingFeatures.push('Property type match');
    }

    // Price range match
    if (property.price >= query.filters.priceRange.min && 
        property.price <= query.filters.priceRange.max) {
      score += 0.2;
      matchingFeatures.push('Price range match');
    }

    // Bedrooms match
    if (query.filters.bedrooms.length === 0 || 
        query.filters.bedrooms.includes(property.bedrooms || 0)) {
      score += 0.1;
      matchingFeatures.push('Bedroom count match');
    }

    // Amenities match
    const commonAmenities = query.filters.amenities.filter(amenity =>
      property.features?.includes(amenity)
    );
    if (commonAmenities.length > 0) {
      score += 0.1 * (commonAmenities.length / query.filters.amenities.length);
      matchingFeatures.push(`${commonAmenities.length} amenities match`);
    }

    // Intent-based scoring
    switch (query.intent.type) {
      case 'buy':
        if (property.category === 'PROPERTY_SALE') score += 0.2;
        break;
      case 'rent':
        if (property.category === 'LONG_TERM_RENTAL') score += 0.2;
        break;
      case 'short_stay':
        if (property.category === 'SHORT_STAY') score += 0.2;
        break;
      case 'invest':
        if (property.category === 'COMMERCIAL' || property.category === 'LANDED_PROPERTY') score += 0.2;
        break;
    }

    return {
      propertyId: property.id,
      relevanceScore: Math.min(score, 1.0),
      matchingFeatures,
      explanation: `Matches ${matchingFeatures.length} criteria with ${Math.round(score * 100)}% relevance`
    };
  }

  private parsePrice(priceString: string): number {
    const match = priceString.match(/(\d+)\s*(million|m|thousand|k|naira|₦)/i);
    if (!match) return 0;

    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'million':
      case 'm':
        return amount * 1000000;
      case 'thousand':
      case 'k':
        return amount * 1000;
      case 'naira':
      case '₦':
        return amount;
      default:
        return amount;
    }
  }

  private analyzeSearchPatterns(searches: string[]): SearchFilters {
    // Analyze common patterns from user's search history
    const filters: SearchFilters = {
      locations: [],
      propertyTypes: [],
      priceRange: { min: 0, max: 100000000 },
      bedrooms: [],
      amenities: [],
      timeframes: [],
      keywords: []
    };

    // Extract common locations
    const locationCount = new Map<string, number>();
    searches.forEach(search => {
      this.NIGERIAN_LOCATIONS.forEach(location => {
        if (search.toLowerCase().includes(location.toLowerCase())) {
          locationCount.set(location, (locationCount.get(location) || 0) + 1);
        }
      });
    });

    filters.locations = Array.from(locationCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([location]) => location);

    return filters;
  }

  private async analyzeSavedProperties(propertyIds: string[]): Promise<SearchFilters> {
    const properties = await prisma.property.findMany({
      where: { id: { in: propertyIds } },
      select: { category: true, price: true, bedrooms: true, features: true }
    });

    const filters: SearchFilters = {
      locations: [],
      propertyTypes: [],
      priceRange: { min: 0, max: 100000000 },
      bedrooms: [],
      amenities: [],
      timeframes: [],
      keywords: []
    };

    // Analyze property types
    const typeCount = new Map<string, number>();
    properties.forEach(property => {
      typeCount.set(property.category, (typeCount.get(property.category) || 0) + 1);
    });

    filters.propertyTypes = Array.from(typeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => type);

    // Analyze price range
    const prices = properties.map(p => p.price).filter(p => p > 0);
    if (prices.length > 0) {
      filters.priceRange = {
        min: Math.min(...prices) * 0.8,
        max: Math.max(...prices) * 1.2
      };
    }

    // Analyze bedrooms
    const bedroomCount = new Map<number, number>();
    properties.forEach(property => {
      if (property.bedrooms) {
        bedroomCount.set(property.bedrooms, (bedroomCount.get(property.bedrooms) || 0) + 1);
      }
    });

    filters.bedrooms = Array.from(bedroomCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([bedrooms]) => bedrooms);

    return filters;
  }

  private mergeFilters(primary: SearchFilters, secondary: SearchFilters): SearchFilters {
    return {
      locations: [...new Set([...primary.locations, ...secondary.locations])],
      propertyTypes: [...new Set([...primary.propertyTypes, ...secondary.propertyTypes])],
      priceRange: {
        min: Math.min(primary.priceRange.min, secondary.priceRange.min),
        max: Math.max(primary.priceRange.max, secondary.priceRange.max)
      },
      bedrooms: [...new Set([...primary.bedrooms, ...secondary.bedrooms])],
      amenities: [...new Set([...primary.amenities, ...secondary.amenities])],
      timeframes: [...new Set([...primary.timeframes, ...secondary.timeframes])],
      keywords: [...new Set([...primary.keywords, ...secondary.keywords])]
    };
  }

  private applyNigerianMarketContext(query: SearchQuery): SearchQuery {
    // Apply Nigerian market-specific adjustments
    const enhancedQuery = { ...query };

    // Adjust price ranges for Nigerian market
    if (enhancedQuery.filters.priceRange.max === 100000000) {
      enhancedQuery.filters.priceRange.max = 500000000; // Allow for luxury properties
    }

    // Add common Nigerian amenities if none specified
    if (enhancedQuery.filters.amenities.length === 0) {
      enhancedQuery.filters.amenities = ['security', 'parking'];
    }

    // Prioritize verified owners in Nigerian market
    if (enhancedQuery.confidence > 0.7) {
      enhancedQuery.confidence = Math.min(enhancedQuery.confidence * 1.1, 1.0);
    }

    return enhancedQuery;
  }

  // Clear AI search caches
  async clearAISearchCaches(): Promise<void> {
    await cacheManager.deletePattern('ai:search:*');
    await cacheManager.deletePattern('semantic:search:*');
  }
}

// Export AI search service instance
export const aiSearchService = new AISearchService(); 
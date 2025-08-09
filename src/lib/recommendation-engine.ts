import prisma from './prisma';
import { cacheManager } from './redis';

// Recommendation interfaces
export interface UserPreference {
  userId: string;
  propertyTypes: string[];
  locations: string[];
  priceRange: { min: number; max: number };
  bedrooms: number[];
  amenities: string[];
  lastSearched: Date;
  searchFrequency: number;
}

export interface PropertySimilarity {
  propertyId: string;
  similarityScore: number;
  commonFeatures: string[];
  priceDifference: number;
  locationDistance: number;
}

export interface RecommendationResult {
  propertyId: string;
  score: number;
  reason: string;
  features: string[];
  price: number;
  location: string;
  image?: string;
  title: string;
}

export interface SearchBehavior {
  userId: string;
  searchTerms: string[];
  filters: Record<string, any>;
  clickedProperties: string[];
  savedProperties: string[];
  inquiryProperties: string[];
  sessionDuration: number;
  searchFrequency: number;
}

export class RecommendationEngine {
  // Get personalized recommendations for a user
  async getPersonalizedRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    const cacheKey = `recommendations:user:${userId}`;
    
    // Try cache first
    const cached = await cacheManager.getAnalytics(cacheKey);
    if (cached) return cached;

    // Get user preferences and behavior
    const [userPreferences, searchBehavior, userInquiries] = await Promise.all([
      this.getUserPreferences(userId),
      this.getSearchBehavior(userId),
      this.getUserInquiries(userId)
    ]);

    // Get all active properties
    const properties = await prisma.property.findMany({
      where: {
        isActive: true,
        moderationStatus: 'APPROVED',
        id: { notIn: userInquiries.map(i => i.propertyId) } // Exclude already inquired
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        owner: { select: { name: true, isVerified: true } }
      }
    });

    // Calculate similarity scores
    const recommendations = properties
      .map(property => this.calculatePropertyScore(property, userPreferences, searchBehavior))
      .filter(rec => rec.score > 0.3) // Filter low-scoring recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache recommendations
    await cacheManager.setAnalytics(cacheKey, recommendations);

    return recommendations;
  }

  // Get similar properties based on a reference property
  async getSimilarProperties(
    propertyId: string, 
    limit: number = 6
  ): Promise<RecommendationResult[]> {
    const cacheKey = `similar:properties:${propertyId}`;
    
    // Try cache first
    const cached = await cacheManager.getAnalytics(cacheKey);
    if (cached) return cached;

    // Get reference property
    const referenceProperty = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        owner: { select: { name: true, isVerified: true } }
      }
    });

    if (!referenceProperty) {
      throw new Error('Reference property not found');
    }

    // Get all other properties in same category and location
    const similarProperties = await prisma.property.findMany({
      where: {
        id: { not: propertyId },
        isActive: true,
        moderationStatus: 'APPROVED',
        category: referenceProperty.category,
        location: { contains: referenceProperty.location, mode: 'insensitive' }
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        owner: { select: { name: true, isVerified: true } }
      }
    });

    // Calculate similarity scores
    const recommendations = similarProperties
      .map(property => this.calculateSimilarityScore(property, referenceProperty))
      .filter(rec => rec.score > 0.4)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache recommendations
    await cacheManager.setAnalytics(cacheKey, recommendations);

    return recommendations;
  }

  // Get trending properties based on views and inquiries
  async getTrendingProperties(limit: number = 10): Promise<RecommendationResult[]> {
    const cacheKey = 'trending:properties';
    
    // Try cache first
    const cached = await cacheManager.getAnalytics(cacheKey);
    if (cached) return cached;

    // Get properties with high engagement
    const trendingProperties = await prisma.property.findMany({
      where: {
        isActive: true,
        moderationStatus: 'APPROVED'
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        owner: { select: { name: true, isVerified: true } },
        _count: {
          select: {
            inquiries: true,
            views: true
          }
        }
      },
      orderBy: [
        { inquiryCount: 'desc' },
        { viewCount: 'desc' }
      ],
      take: limit * 2 // Get more to filter
    });

    // Calculate trending scores
    const recommendations = trendingProperties
      .map(property => this.calculateTrendingScore(property))
      .filter(rec => rec.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache recommendations
    await cacheManager.setAnalytics(cacheKey, recommendations);

    return recommendations;
  }

  // Get location-based recommendations
  async getLocationBasedRecommendations(
    location: string, 
    limit: number = 8
  ): Promise<RecommendationResult[]> {
    const cacheKey = `location:recommendations:${location}`;
    
    // Try cache first
    const cached = await cacheManager.getAnalytics(cacheKey);
    if (cached) return cached;

    // Get properties in the location
    const locationProperties = await prisma.property.findMany({
      where: {
        isActive: true,
        moderationStatus: 'APPROVED',
        OR: [
          { location: { contains: location, mode: 'insensitive' } },
          { city: { contains: location, mode: 'insensitive' } },
          { state: { contains: location, mode: 'insensitive' } }
        ]
      },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        owner: { select: { name: true, isVerified: true } }
      },
      orderBy: [
        { viewCount: 'desc' },
        { inquiryCount: 'desc' }
      ],
      take: limit
    });

    // Calculate location-based scores
    const recommendations = locationProperties
      .map(property => this.calculateLocationScore(property, location))
      .sort((a, b) => b.score - a.score);

    // Cache recommendations
    await cacheManager.setAnalytics(cacheKey, recommendations);

    return recommendations;
  }

  // Get user preferences based on behavior
  private async getUserPreferences(userId: string): Promise<UserPreference> {
    const [inquiries, searches, savedProperties] = await Promise.all([
      prisma.propertyInquiry.findMany({
        where: { inquirerId: userId },
        include: { property: true }
      }),
      prisma.propertyView.findMany({
        where: { userId },
        include: { property: true },
        orderBy: { viewedAt: 'desc' },
        take: 50
      }),
      prisma.propertyFavorite.findMany({
        where: { userId },
        include: { property: true }
      })
    ]);

    // Analyze property types
    const propertyTypes = this.analyzePropertyTypes([...inquiries, ...searches, ...savedProperties]);

    // Analyze locations
    const locations = this.analyzeLocations([...inquiries, ...searches, ...savedProperties]);

    // Analyze price range
    const priceRange = this.analyzePriceRange([...inquiries, ...searches, ...savedProperties]);

    // Analyze bedrooms
    const bedrooms = this.analyzeBedrooms([...inquiries, ...searches, ...savedProperties]);

    // Analyze amenities
    const amenities = this.analyzeAmenities([...inquiries, ...searches, ...savedProperties]);

    return {
      userId,
      propertyTypes,
      locations,
      priceRange,
      bedrooms,
      amenities,
      lastSearched: searches[0]?.viewedAt || new Date(),
      searchFrequency: searches.length
    };
  }

  // Get user search behavior
  private async getSearchBehavior(userId: string): Promise<SearchBehavior> {
    const [searches, clicks, saves, inquiries] = await Promise.all([
      prisma.propertyView.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
        take: 100
      }),
      prisma.propertyView.findMany({
        where: { userId },
        orderBy: { viewedAt: 'desc' },
        take: 20
      }),
      prisma.propertyFavorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.propertyInquiry.findMany({
        where: { inquirerId: userId },
        orderBy: { createdAt: 'desc' },
        take: 20
      })
    ]);

    return {
      userId,
      searchTerms: this.extractSearchTerms(searches),
      filters: this.extractFilters(searches),
      clickedProperties: clicks.map(c => c.propertyId),
      savedProperties: saves.map(s => s.propertyId),
      inquiryProperties: inquiries.map(i => i.propertyId),
      sessionDuration: this.calculateSessionDuration(searches),
      searchFrequency: searches.length
    };
  }

  // Get user inquiries
  private async getUserInquiries(userId: string) {
    return await prisma.propertyInquiry.findMany({
      where: { inquirerId: userId },
      select: { propertyId: true }
    });
  }

  // Calculate property score for personalized recommendations
  private calculatePropertyScore(
    property: any, 
    preferences: UserPreference, 
    behavior: SearchBehavior
  ): RecommendationResult {
    let score = 0;
    const reasons: string[] = [];

    // Property type match
    if (preferences.propertyTypes.includes(property.category)) {
      score += 0.3;
      reasons.push('Matches your preferred property type');
    }

    // Location match
    if (preferences.locations.some(loc => 
      property.location.toLowerCase().includes(loc.toLowerCase()) ||
      property.city.toLowerCase().includes(loc.toLowerCase())
    )) {
      score += 0.25;
      reasons.push('In your preferred location');
    }

    // Price range match
    if (property.price >= preferences.priceRange.min && 
        property.price <= preferences.priceRange.max) {
      score += 0.2;
      reasons.push('Within your budget range');
    }

    // Bedrooms match
    if (preferences.bedrooms.includes(property.bedrooms || 0)) {
      score += 0.15;
      reasons.push('Matches your bedroom preference');
    }

    // Amenities match
    const commonAmenities = preferences.amenities.filter(amenity =>
      property.features.includes(amenity)
    );
    if (commonAmenities.length > 0) {
      score += 0.1 * (commonAmenities.length / preferences.amenities.length);
      reasons.push(`Has ${commonAmenities.length} of your preferred amenities`);
    }

    // Search behavior bonus
    if (behavior.clickedProperties.includes(property.id)) {
      score += 0.1;
      reasons.push('You showed interest in this property');
    }

    // Owner verification bonus
    if (property.owner.isVerified) {
      score += 0.05;
      reasons.push('Verified property owner');
    }

    return {
      propertyId: property.id,
      score,
      reason: reasons.join(', '),
      features: property.features || [],
      price: property.price,
      location: property.location,
      image: property.images[0]?.url,
      title: property.title
    };
  }

  // Calculate similarity score between two properties
  private calculateSimilarityScore(
    property: any, 
    referenceProperty: any
  ): RecommendationResult {
    let score = 0;
    const reasons: string[] = [];

    // Category match
    if (property.category === referenceProperty.category) {
      score += 0.3;
      reasons.push('Same property type');
    }

    // Location similarity
    if (property.location === referenceProperty.location) {
      score += 0.25;
      reasons.push('Same location');
    } else if (property.city === referenceProperty.city) {
      score += 0.15;
      reasons.push('Same city');
    }

    // Price similarity (within 20% range)
    const priceDiff = Math.abs(property.price - referenceProperty.price) / referenceProperty.price;
    if (priceDiff <= 0.2) {
      score += 0.2;
      reasons.push('Similar price range');
    }

    // Bedrooms similarity
    if (property.bedrooms === referenceProperty.bedrooms) {
      score += 0.15;
      reasons.push('Same number of bedrooms');
    }

    // Features similarity
    const commonFeatures = (property.features || []).filter((f: string) =>
      (referenceProperty.features || []).includes(f)
    );
    if (commonFeatures.length > 0) {
      score += 0.1 * (commonFeatures.length / Math.max(property.features?.length || 1, referenceProperty.features?.length || 1));
      reasons.push(`Shares ${commonFeatures.length} features`);
    }

    return {
      propertyId: property.id,
      score,
      reason: reasons.join(', '),
      features: property.features || [],
      price: property.price,
      location: property.location,
      image: property.images[0]?.url,
      title: property.title
    };
  }

  // Calculate trending score
  private calculateTrendingScore(property: any): RecommendationResult {
    const viewWeight = 0.4;
    const inquiryWeight = 0.6;
    
    const viewScore = Math.min(property._count.views / 100, 1) * viewWeight;
    const inquiryScore = Math.min(property._count.inquiries / 10, 1) * inquiryWeight;
    
    const score = viewScore + inquiryScore;

    return {
      propertyId: property.id,
      score,
      reason: `High engagement: ${property._count.views} views, ${property._count.inquiries} inquiries`,
      features: property.features || [],
      price: property.price,
      location: property.location,
      image: property.images[0]?.url,
      title: property.title
    };
  }

  // Calculate location-based score
  private calculateLocationScore(property: any, location: string): RecommendationResult {
    let score = 0.5; // Base score for location match
    const reasons: string[];

    // Location exact match
    if (property.location.toLowerCase().includes(location.toLowerCase())) {
      score += 0.3;
      reasons = ['Exact location match'];
    } else if (property.city.toLowerCase().includes(location.toLowerCase())) {
      score += 0.2;
      reasons = ['Same city'];
    } else {
      score += 0.1;
      reasons = ['Nearby area'];
    }

    // Popularity bonus
    if (property.viewCount > 50) {
      score += 0.1;
      reasons.push('Popular in this area');
    }

    // Price competitiveness
    const avgPrice = 50000000; // Average price for the area
    if (property.price <= avgPrice * 1.1) {
      score += 0.1;
      reasons.push('Competitive pricing');
    }

    return {
      propertyId: property.id,
      score,
      reason: reasons.join(', '),
      features: property.features || [],
      price: property.price,
      location: property.location,
      image: property.images[0]?.url,
      title: property.title
    };
  }

  // Helper methods for preference analysis
  private analyzePropertyTypes(properties: any[]): string[] {
    const typeCount = new Map<string, number>();
    properties.forEach(p => {
      const type = p.property?.category || 'Unknown';
      typeCount.set(type, (typeCount.get(type) || 0) + 1);
    });
    
    return Array.from(typeCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type]) => type);
  }

  private analyzeLocations(properties: any[]): string[] {
    const locationCount = new Map<string, number>();
    properties.forEach(p => {
      const location = p.property?.location || 'Unknown';
      locationCount.set(location, (locationCount.get(location) || 0) + 1);
    });
    
    return Array.from(locationCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location]) => location);
  }

  private analyzePriceRange(properties: any[]): { min: number; max: number } {
    const prices = properties.map(p => p.property?.price || 0).filter(p => p > 0);
    if (prices.length === 0) return { min: 0, max: 100000000 };
    
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    return {
      min: Math.max(avg * 0.7, 10000000),
      max: Math.min(avg * 1.3, 200000000)
    };
  }

  private analyzeBedrooms(properties: any[]): number[] {
    const bedroomCount = new Map<number, number>();
    properties.forEach(p => {
      const bedrooms = p.property?.bedrooms || 0;
      bedroomCount.set(bedrooms, (bedroomCount.get(bedrooms) || 0) + 1);
    });
    
    return Array.from(bedroomCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([bedrooms]) => bedrooms);
  }

  private analyzeAmenities(properties: any[]): string[] {
    const amenityCount = new Map<string, number>();
    properties.forEach(p => {
      const amenities = p.property?.features || [];
      amenities.forEach(amenity => {
        amenityCount.set(amenity, (amenityCount.get(amenity) || 0) + 1);
      });
    });
    
    return Array.from(amenityCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([amenity]) => amenity);
  }

  private extractSearchTerms(searches: any[]): string[] {
    // Extract search terms from property titles and locations
    const terms = new Set<string>();
    searches.forEach(search => {
      const title = search.property?.title || '';
      const location = search.property?.location || '';
      
      title.split(' ').forEach(word => {
        if (word.length > 3) terms.add(word.toLowerCase());
      });
      location.split(' ').forEach(word => {
        if (word.length > 3) terms.add(word.toLowerCase());
      });
    });
    
    return Array.from(terms).slice(0, 20);
  }

  private extractFilters(searches: any[]): Record<string, any> {
    // Extract common filters from search behavior
    const filters: Record<string, any> = {};
    
    // Price range
    const prices = searches.map(s => s.property?.price || 0).filter(p => p > 0);
    if (prices.length > 0) {
      filters.priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    }
    
    // Property types
    const types = searches.map(s => s.property?.category).filter(Boolean);
    if (types.length > 0) {
      filters.propertyTypes = [...new Set(types)];
    }
    
    // Locations
    const locations = searches.map(s => s.property?.location).filter(Boolean);
    if (locations.length > 0) {
      filters.locations = [...new Set(locations)];
    }
    
    return filters;
  }

  private calculateSessionDuration(searches: any[]): number {
    if (searches.length < 2) return 0;
    
    const sorted = searches.sort((a, b) => 
      new Date(a.viewedAt).getTime() - new Date(b.viewedAt).getTime()
    );
    
    const first = new Date(sorted[0].viewedAt);
    const last = new Date(sorted[sorted.length - 1].viewedAt);
    
    return (last.getTime() - first.getTime()) / 1000; // Duration in seconds
  }

  // Clear recommendation caches
  async clearRecommendationCaches(): Promise<void> {
    await cacheManager.deletePattern('recommendations:*');
    await cacheManager.deletePattern('similar:*');
    await cacheManager.deletePattern('trending:*');
    await cacheManager.deletePattern('location:recommendations:*');
  }
}

// Export recommendation engine instance
export const recommendationEngine = new RecommendationEngine(); 
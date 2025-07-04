import { PropertyCreationData, ApiResponse, Property } from "@/types/api";
import { toKobo } from "@/utils/api";

/**
 * API Service for property management
 */
class ApiService {
  private baseUrl = '/api';

  /**
   * Create a new property listing
   */
  async createProperty(data: PropertyCreationData): Promise<ApiResponse<Property>> {
    try {
      const response = await fetch(`${this.baseUrl}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create property');
      }

      return result;
    } catch (error: any) {
      console.error('Property creation error:', error);
      throw new Error(error.message || 'Failed to create property');
    }
  }

  /**
   * Get properties with search and filters
   */
  async getProperties(filters: Record<string, any> = {}): Promise<any> {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/properties?${queryString}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch properties');
      }

      return result;
    } catch (error: any) {
      console.error('Properties fetch error:', error);
      throw new Error(error.message || 'Failed to fetch properties');
    }
  }

  /**
   * Get property details by ID
   */
  async getProperty(id: string): Promise<ApiResponse<Property>> {
    try {
      const response = await fetch(`${this.baseUrl}/properties/${id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch property');
      }

      return result;
    } catch (error: any) {
      console.error('Property fetch error:', error);
      throw new Error(error.message || 'Failed to fetch property');
    }
  }

  /**
   * Register a new user
   */
  async registerUser(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
    accountType?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to register user');
      }

      return result;
    } catch (error: any) {
      console.error('User registration error:', error);
      throw new Error(error.message || 'Failed to register user');
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch user profile');
      }

      return result;
    } catch (error: any) {
      console.error('User profile fetch error:', error);
      throw new Error(error.message || 'Failed to fetch user profile');
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update user profile');
      }

      return result;
    } catch (error: any) {
      console.error('User profile update error:', error);
      throw new Error(error.message || 'Failed to update user profile');
    }
  }

  /**
   * Get user's properties
   */
  async getUserProperties(filters: Record<string, any> = {}): Promise<any> {
    try {
      const queryString = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryString.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/users/properties?${queryString}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch user properties');
      }

      return result;
    } catch (error: any) {
      console.error('User properties fetch error:', error);
      throw new Error(error.message || 'Failed to fetch user properties');
    }
  }

  /**
   * Create property inquiry
   */
  async createPropertyInquiry(propertyId: string, inquiryData: {
    message: string;
    inquiryType: string;
    contactPreference: string;
    intendedUse?: string;
    budget?: number;
    timeframe?: string;
    financingNeeded: boolean;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/properties/${propertyId}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send inquiry');
      }

      return result;
    } catch (error: any) {
      console.error('Property inquiry error:', error);
      throw new Error(error.message || 'Failed to send inquiry');
    }
  }
}

export const apiService = new ApiService(); 
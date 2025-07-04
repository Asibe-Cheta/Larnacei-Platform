# Larnacei Platform API Documentation

## Overview

The Larnacei Platform API provides comprehensive endpoints for property management, user authentication, and administrative functions. All endpoints follow RESTful conventions and return consistent JSON responses.

## Base URL

```
https://your-domain.com/api
```

## Authentication

Most endpoints require authentication using NextAuth.js. Include the session token in your requests.

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "error": string (optional)
}
```

For paginated responses:

```json
{
  "success": boolean,
  "message": string,
  "data": array,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number,
    "hasNext": boolean,
    "hasPrev": boolean
  }
}
```

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+2348012345678",
  "password": "SecurePassword123!",
  "role": "SEEKER",
  "accountType": "INDIVIDUAL"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348012345678",
    "role": "SEEKER",
    "accountType": "INDIVIDUAL",
    "isVerified": false,
    "verificationLevel": "NONE",
    "kycStatus": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### NextAuth Endpoints

**GET/POST** `/auth/[...nextauth]`

NextAuth.js authentication endpoints for login, logout, and session management.

## Property Management Endpoints

### Create Property

**POST** `/properties`

Create a new property listing.

**Request Body:**
```json
{
  "title": "Beautiful 3-Bedroom Apartment",
  "description": "Spacious apartment with modern amenities...",
  "type": "APARTMENT",
  "category": "LONG_TERM_RENTAL",
  "purpose": "FOR_RENT",
  "location": "Lekki Phase 1",
  "state": "Lagos",
  "city": "Lekki",
  "lga": "Eti-Osa",
  "streetAddress": "123 Admiralty Way",
  "landmark": "Near Shoprite",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "price": 5000000,
  "currency": "NGN",
  "isNegotiable": true,
  "bedrooms": 3,
  "bathrooms": 2,
  "toilets": 2,
  "sizeInSqm": 120,
  "parkingSpaces": 2,
  "features": ["Air Conditioning", "Security", "Swimming Pool"],
  "furnishingStatus": "FURNISHED",
  "condition": "NEW",
  "images": ["https://example.com/image1.jpg"],
  "titleDocuments": {
    "certificateOfOccupancy": true,
    "surveyPlan": true
  },
  "ownershipType": "PERSONAL",
  "legalStatus": "CLEAR",
  "availabilityStatus": "AVAILABLE",
  "inspectionType": "BY_APPOINTMENT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property created successfully",
  "data": {
    "id": "property_id",
    "title": "Beautiful 3-Bedroom Apartment",
    // ... full property object
  }
}
```

### Get Properties (Search)

**GET** `/properties`

Search and filter properties.

**Query Parameters:**
- `query` (string): Search term
- `type` (string): Property type (APARTMENT, HOUSE, etc.)
- `category` (string): Property category
- `purpose` (string): Property purpose
- `state` (string): State filter
- `city` (string): City filter
- `minPrice` (number): Minimum price in kobo
- `maxPrice` (number): Maximum price in kobo
- `bedrooms` (number): Number of bedrooms
- `bathrooms` (number): Number of bathrooms
- `condition` (string): Property condition
- `furnishingStatus` (string): Furnishing status
- `availabilityStatus` (string): Availability status
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `sortBy` (string): Sort field (price, createdAt, viewCount)
- `sortOrder` (string): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [
    {
      "id": "property_id",
      "title": "Beautiful 3-Bedroom Apartment",
      "price": 5000000,
      "currency": "NGN",
      "location": "Lekki Phase 1",
      "images": [
        {
          "id": "image_id",
          "url": "https://example.com/image1.jpg",
          "isPrimary": true
        }
      ],
      "owner": {
        "id": "owner_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "_count": {
        "images": 5,
        "videos": 2,
        "reviews": 3,
        "inquiries": 1
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Property Details

**GET** `/properties/{id}`

Get detailed information about a specific property.

**Response:**
```json
{
  "success": true,
  "message": "Property details fetched successfully",
  "data": {
    "id": "property_id",
    "title": "Beautiful 3-Bedroom Apartment",
    "description": "Spacious apartment with modern amenities...",
    "type": "APARTMENT",
    "category": "LONG_TERM_RENTAL",
    "purpose": "FOR_RENT",
    "location": "Lekki Phase 1",
    "state": "Lagos",
    "city": "Lekki",
    "lga": "Eti-Osa",
    "streetAddress": "123 Admiralty Way",
    "landmark": "Near Shoprite",
    "latitude": 6.5244,
    "longitude": 3.3792,
    "price": 5000000,
    "currency": "NGN",
    "isNegotiable": true,
    "bedrooms": 3,
    "bathrooms": 2,
    "toilets": 2,
    "sizeInSqm": 120,
    "parkingSpaces": 2,
    "features": ["Air Conditioning", "Security", "Swimming Pool"],
    "furnishingStatus": "FURNISHED",
    "condition": "NEW",
    "availabilityStatus": "AVAILABLE",
    "availableFrom": null,
    "inspectionType": "BY_APPOINTMENT",
    "titleDocuments": {
      "certificateOfOccupancy": true,
      "surveyPlan": true
    },
    "ownershipType": "PERSONAL",
    "legalStatus": "CLEAR",
    "virtualTourUrl": null,
    "floorPlanUrl": null,
    "isActive": true,
    "isVerified": true,
    "isFeatured": false,
    "moderationStatus": "APPROVED",
    "viewCount": 15,
    "inquiryCount": 3,
    "favoriteCount": 2,
    "ownerId": "owner_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "owner": {
      "id": "owner_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+2348012345678",
      "role": "OWNER",
      "accountType": "INDIVIDUAL",
      "isVerified": true,
      "verificationLevel": "EMAIL_VERIFIED",
      "location": "Lagos",
      "experience": 5,
      "specialization": ["Residential", "Commercial"],
      "contactPreference": "EMAIL"
    },
    "images": [
      {
        "id": "image_id",
        "url": "https://example.com/image1.jpg",
        "alt": "Living Room",
        "order": 0,
        "isPrimary": true
      }
    ],
    "videos": [
      {
        "id": "video_id",
        "url": "https://example.com/video1.mp4",
        "title": "Property Walkthrough",
        "type": "WALKTHROUGH"
      }
    ],
    "reviews": [
      {
        "id": "review_id",
        "rating": 5,
        "comment": "Great property!",
        "author": {
          "id": "user_id",
          "name": "Jane Smith",
          "image": "https://example.com/avatar.jpg"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "_count": {
      "images": 5,
      "videos": 2,
      "reviews": 3,
      "inquiries": 1,
      "favorites": 2
    }
  }
}
```

### Update Property

**PUT** `/properties/{id}`

Update property details (owner only).

**Request Body:** Same as property creation, but all fields are optional.

### Delete Property

**DELETE** `/properties/{id}`

Delete a property (owner only).

## Property Inquiry Endpoints

### Create Property Inquiry

**POST** `/properties/{id}/inquiries`

Send an inquiry about a property.

**Request Body:**
```json
{
  "message": "I'm interested in viewing this property. Is it still available?",
  "inquiryType": "VIEWING_REQUEST",
  "contactPreference": "EMAIL",
  "intendedUse": "Personal residence",
  "budget": 6000000,
  "timeframe": "Within 2 weeks",
  "financingNeeded": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inquiry sent successfully",
  "data": {
    "id": "inquiry_id",
    "message": "I'm interested in viewing this property...",
    "inquiryType": "VIEWING_REQUEST",
    "contactPreference": "EMAIL",
    "intendedUse": "Personal residence",
    "budget": 6000000,
    "timeframe": "Within 2 weeks",
    "financingNeeded": false,
    "status": "NEW",
    "propertyId": "property_id",
    "inquirerId": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "property": {
      "id": "property_id",
      "title": "Beautiful 3-Bedroom Apartment",
      "location": "Lekki Phase 1",
      "price": 5000000,
      "currency": "NGN"
    },
    "inquirer": {
      "id": "user_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+2348012345679"
    }
  }
}
```

### Get Property Inquiries

**GET** `/properties/{id}/inquiries`

Get inquiries for a property (owner only).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

## User Management Endpoints

### Get User Profile

**GET** `/users/profile`

Get current user's profile information.

**Response:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+2348012345678",
    "image": "https://example.com/avatar.jpg",
    "role": "OWNER",
    "accountType": "INDIVIDUAL",
    "isVerified": true,
    "verificationLevel": "EMAIL_VERIFIED",
    "kycStatus": "APPROVED",
    "bio": "Experienced real estate professional",
    "location": "Lagos",
    "experience": 5,
    "specialization": ["Residential", "Commercial"],
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "twitter": "https://twitter.com/johndoe"
    },
    "contactPreference": "EMAIL",
    "availabilityHours": {
      "monday": "9:00-17:00",
      "tuesday": "9:00-17:00"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "properties": 5,
      "bookings": 2,
      "reviews": 3,
      "inquiries": 10,
      "favorites": 8
    }
  }
}
```

### Update User Profile

**PUT** `/users/profile`

Update current user's profile.

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "phone": "+2348012345678",
  "bio": "Updated bio",
  "location": "Lagos, Nigeria",
  "experience": 6,
  "specialization": ["Residential", "Commercial", "Land"],
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/johndoe",
    "twitter": "https://twitter.com/johndoe"
  },
  "contactPreference": "WHATSAPP"
}
```

### Get User Properties

**GET** `/users/properties`

Get current user's properties.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (all, active, pending, rejected, inactive)

**Response:**
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [
    {
      "id": "property_id",
      "title": "Beautiful 3-Bedroom Apartment",
      "price": 5000000,
      "currency": "NGN",
      "location": "Lekki Phase 1",
      "isActive": true,
      "moderationStatus": "APPROVED",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "images": [
        {
          "id": "image_id",
          "url": "https://example.com/image1.jpg",
          "isPrimary": true
        }
      ],
      "_count": {
        "images": 5,
        "videos": 2,
        "reviews": 3,
        "inquiries": 1
      }
    }
  ],
  "summary": {
    "total": 5,
    "active": 3,
    "pending": 1,
    "rejected": 0,
    "inactive": 1
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

## Admin Endpoints

### Get Properties for Moderation

**GET** `/admin/properties`

Get properties for admin moderation.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `status` (string): Filter by status (pending, approved, rejected, all)

**Response:**
```json
{
  "success": true,
  "message": "Properties fetched successfully",
  "data": [
    {
      "id": "property_id",
      "title": "Beautiful 3-Bedroom Apartment",
      "price": 5000000,
      "currency": "NGN",
      "location": "Lekki Phase 1",
      "isActive": false,
      "moderationStatus": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "owner": {
        "id": "owner_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+2348012345678",
        "isVerified": true,
        "verificationLevel": "EMAIL_VERIFIED",
        "role": "OWNER"
      },
      "images": [
        {
          "id": "image_id",
          "url": "https://example.com/image1.jpg",
          "isPrimary": true
        }
      ],
      "_count": {
        "images": 5,
        "videos": 2,
        "reviews": 0,
        "inquiries": 0
      }
    }
  ],
  "summary": {
    "total": 25,
    "pending": 8,
    "approved": 15,
    "rejected": 2,
    "flagged": 0
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Update Property Moderation Status

**PUT** `/admin/properties`

Update property moderation status.

**Request Body:**
```json
{
  "propertyId": "property_id",
  "moderationStatus": "APPROVED",
  "reason": "Property meets all requirements"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Property approved successfully",
  "data": {
    "id": "property_id",
    "title": "Beautiful 3-Bedroom Apartment",
    "isActive": true,
    "moderationStatus": "APPROVED",
    "owner": {
      "id": "owner_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+2348012345678"
    }
  }
}
```

## Data Types

### Property Types
- `APARTMENT`
- `HOUSE`
- `LAND`
- `COMMERCIAL`
- `VILLA`
- `DUPLEX`
- `STUDIO`
- `PENTHOUSE`

### Property Categories
- `SHORT_STAY`
- `LONG_TERM_RENTAL`
- `LANDED_PROPERTY`
- `PROPERTY_SALE`

### Property Purposes
- `FOR_SALE`
- `FOR_RENT`
- `FOR_LEASE`
- `SHORT_STAY`

### Property Conditions
- `NEW`
- `OLD`
- `RENOVATED`
- `UNDER_CONSTRUCTION`
- `NEEDS_RENOVATION`

### Furnishing Status
- `FURNISHED`
- `SEMI_FURNISHED`
- `UNFURNISHED`

### Availability Status
- `AVAILABLE`
- `OCCUPIED`
- `MAINTENANCE`
- `RESERVED`

### Moderation Status
- `PENDING`
- `APPROVED`
- `REJECTED`
- `FLAGGED`
- `UNDER_REVIEW`

### User Roles
- `SEEKER`
- `OWNER`
- `AGENT`
- `ADMIN`
- `SUPER_ADMIN`

### Account Types
- `INDIVIDUAL`
- `AGENT`
- `AGENCY`
- `CORPORATE`

### Contact Preferences
- `EMAIL`
- `PHONE`
- `WHATSAPP`
- `PLATFORM_MESSAGE`

### Inquiry Types
- `GENERAL_INFO`
- `VIEWING_REQUEST`
- `PRICE_INQUIRY`
- `PURCHASE_INTENT`
- `RENTAL_APPLICATION`
- `INVESTMENT_INQUIRY`

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Limits vary by endpoint and user role.

## Security

- All sensitive data is encrypted
- Passwords are hashed using bcrypt
- JWT tokens are used for session management
- Input validation is performed on all endpoints
- SQL injection protection via Prisma ORM

## Nigerian Market Features

- Nigerian phone number validation (+234 format)
- NIN (National Identification Number) validation
- Nigerian currency (NGN) support with kobo precision
- Local Government Area (LGA) support
- Nigerian states and cities
- Local date/time formatting 
# Property Inquiry & Communication System

## 🎯 Overview

The Larnacei Property Inquiry & Communication System is a comprehensive solution that enables seamless communication between property seekers and property owners/agents. The system supports multiple communication channels and provides a complete inquiry management platform.

## ✅ Implemented Features

### 1. Enhanced Property Inquiry Forms
- **Location**: `/properties/[id]` pages
- **Features**:
  - Comprehensive inquiry form with all required fields
  - Nigerian phone number validation (+234 format)
  - Multiple inquiry types (General Info, Viewing Request, Price Inquiry, etc.)
  - Budget and timeframe specifications
  - Financing needs indication
  - Viewing preferences with date/time selection
  - Virtual viewing interest option

### 2. Multiple Contact Options
- **WhatsApp Integration**: Pre-filled messages with property context
- **Phone Call Integration**: Click-to-call functionality
- **Email Integration**: Pre-filled email with property details
- **In-Platform Messaging**: Direct messaging through the platform

### 3. Professional Email Notification System
- **Location**: `src/lib/email-service.ts`
- **Features**:
  - Professional Larnacei-branded email templates
  - Nigerian market-focused design with #7C0302 color scheme
  - Mobile-responsive email design
  - Multiple notification types:
    - New inquiry notifications (to property owners)
    - Inquiry confirmation emails (to inquirers)
    - Message notifications
    - Viewing appointment confirmations

### 4. WhatsApp Integration
- **Location**: `src/utils/whatsapp.ts`
- **Features**:
  - Pre-filled message templates based on inquiry type
  - Nigerian phone number formatting (+234)
  - Mobile and desktop WhatsApp support
  - Property context automatically included
  - Fallback handling for unsupported devices

### 5. Enhanced Database Schema
- **Location**: `prisma/schema.prisma`
- **New Models**:
  - `Conversation`: Manages messaging threads
  - `ConversationParticipant`: Tracks conversation participants
  - `MessageAttachment`: Handles file attachments
  - Enhanced `PropertyInquiry` with additional fields
  - Enhanced `Message` with conversation support

### 6. Comprehensive API Endpoints
- **Inquiry Management**: `/api/inquiries`
  - GET: Fetch inquiries with filtering, sorting, and pagination
  - PUT: Bulk update inquiry statuses
- **Conversations**: `/api/conversations`
  - GET: Fetch user conversations
  - POST: Create new conversations
- **Messages**: `/api/conversations/[id]/messages`
  - GET: Fetch conversation messages
  - POST: Send new messages
- **Property Inquiries**: `/api/properties/[id]/inquire`
  - POST: Submit property inquiries

### 7. Enhanced Inquiry Management Dashboard
- **Location**: `/dashboard/inquiries`
- **Features**:
  - Summary statistics (total, new, responded, in progress, closed, spam)
  - Advanced filtering (status, type, date range, property)
  - Sorting options (date, status, type)
  - Bulk actions (mark as read, archive, etc.)
  - Pagination support
  - Real-time status updates

### 8. In-Platform Messaging System
- **Location**: `/dashboard/messages`
- **Features**:
  - Conversation list with unread message counts
  - Real-time messaging interface
  - Message status indicators
  - File attachment support (ready for implementation)
  - Conversation filtering and sorting
  - Mobile-responsive design

### 9. Dashboard Navigation
- **Location**: `src/app/dashboard/layout.tsx`
- **Features**:
  - Added "Messages" tab to dashboard navigation
  - Integrated with existing dashboard structure
  - Consistent styling with Larnacei branding

## 🏗️ Architecture

### Database Schema
```sql
-- Enhanced PropertyInquiry model
model PropertyInquiry {
  id                    String    @id @default(cuid())
  message               String
  inquiryType           InquiryType
  contactPreference     ContactPreference
  inquirerName          String?   // For non-registered users
  inquirerEmail         String?   // For non-registered users
  inquirerPhone         String?   // For non-registered users
  preferredContactMethod String?
  intendedUse           String?
  budget                Int?
  timeframe             String?
  financingNeeded       Boolean   @default(false)
  requestViewing        Boolean   @default(false)
  viewingDate           DateTime?
  viewingTime           String?
  virtualViewingInterest Boolean  @default(false)
  status                InquiryStatus @default(NEW)
  conversationId        String?
  conversation          Conversation? @relation(fields: [conversationId], references: [id])
  // ... other fields
}

-- New messaging models
model Conversation {
  id              String              @id @default(cuid())
  propertyId      String
  property        Property            @relation(fields: [propertyId], references: [id])
  status          ConversationStatus  @default(ACTIVE)
  participants    ConversationParticipant[]
  messages        Message[]
  inquiries       PropertyInquiry[]
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
}

model Message {
  id              String              @id @default(cuid())
  content         String
  messageType     MessageType         @default(TEXT)
  isRead          Boolean             @default(false)
  readAt          DateTime?
  conversationId  String
  conversation    Conversation        @relation(fields: [conversationId], references: [id])
  senderId        String
  sender          User                @relation(fields: [senderId], references: [id])
  attachments     MessageAttachment[]
  createdAt       DateTime            @default(now())
}
```

### API Structure
```
/api/
├── inquiries/
│   └── route.ts                    # Inquiry management
├── conversations/
│   ├── route.ts                    # Conversation management
│   └── [id]/
│       └── messages/
│           └── route.ts            # Message handling
└── properties/
    └── [id]/
        └── inquire/
            └── route.ts            # Property inquiry submission
```

## 🎨 UI/UX Features

### Design Consistency
- **Color Scheme**: #7C0302 (Larnacei brand color)
- **Typography**: Consistent with existing platform
- **Mobile-First**: Responsive design for Nigerian mobile market
- **Professional**: Business-focused interface

### User Experience
- **Intuitive Forms**: Clear field labels and validation
- **Quick Actions**: One-click contact options
- **Status Indicators**: Clear visual feedback
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages

## 📧 Email Templates

### Professional Nigerian Market Design
- **Larnacei Branding**: Company logo and colors
- **Mobile Responsive**: Optimized for mobile devices
- **Clear CTAs**: Prominent action buttons
- **Nigerian Context**: Localized language and examples

### Template Types
1. **New Inquiry Notification** (to property owner)
2. **Inquiry Confirmation** (to inquirer)
3. **Message Notification** (for new messages)
4. **Viewing Confirmation** (appointment details)

## 🔒 Security & Privacy

### Data Protection
- **Input Validation**: Comprehensive form validation
- **Phone Number Validation**: Nigerian format validation
- **Rate Limiting**: Protection against spam
- **Authentication**: Secure API endpoints

### Nigerian Compliance
- **Phone Format**: +234 validation
- **Data Retention**: Configurable retention policies
- **User Consent**: Clear privacy notices
- **Contact Preferences**: User-controlled sharing

## 📱 Mobile Optimization

### Mobile-Specific Features
- **Touch-Friendly**: Optimized button sizes
- **WhatsApp Deep-Linking**: Seamless app integration
- **Responsive Forms**: Mobile-optimized layouts
- **Quick Actions**: Easy access to contact options

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- SMTP email service (for notifications)

### Environment Variables
```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Database
DATABASE_URL=postgresql://...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## 📊 Usage Examples

### Submitting an Inquiry
1. Navigate to any property detail page
2. Fill out the enhanced contact form
3. Choose inquiry type and preferences
4. Submit or use quick contact options

### Managing Inquiries (Property Owner)
1. Access `/dashboard/inquiries`
2. View summary statistics
3. Filter and sort inquiries
4. Use bulk actions for efficiency
5. Respond via platform messaging

### Messaging (Both Parties)
1. Access `/dashboard/messages`
2. Select conversation from list
3. Send and receive messages
4. View conversation history

## 🔧 Configuration

### Email Templates
- Templates are located in `src/lib/email-service.ts`
- Customize colors, branding, and content
- Test with different email clients

### WhatsApp Integration
- Templates in `src/utils/whatsapp.ts`
- Customize message formats
- Test on different devices

### Database
- Schema in `prisma/schema.prisma`
- Run migrations for schema changes
- Backup data before major changes

## 🧪 Testing

### Manual Testing Checklist
- [ ] Property inquiry form submission
- [ ] Email notification delivery
- [ ] WhatsApp message generation
- [ ] Dashboard inquiry management
- [ ] Messaging system functionality
- [ ] Mobile responsiveness
- [ ] Form validation
- [ ] Error handling

### API Testing
```bash
# Test inquiry submission
curl -X POST /api/properties/[id]/inquire \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com",...}'

# Test inquiry fetching
curl -X GET /api/inquiries?status=new&page=1&limit=10
```

## 🚀 Future Enhancements

### Phase 2 Features
- [ ] Real-time messaging with WebSockets
- [ ] File attachment support
- [ ] Message templates for common responses
- [ ] Advanced analytics and reporting
- [ ] Push notifications
- [ ] Voice message support
- [ ] Video calling integration

### Phase 3 Features
- [ ] AI-powered inquiry routing
- [ ] Automated response suggestions
- [ ] Integration with CRM systems
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] Advanced security features

## 📞 Support

For technical support or questions about the inquiry system:
- Check the API documentation
- Review the database schema
- Test with the provided examples
- Contact the development team

## 📄 License

This inquiry system is part of the Larnacei platform and follows the same licensing terms.

---

**Built with ❤️ for the Nigerian property market** 
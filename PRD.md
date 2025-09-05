# Product Requirements Document: Invoice Parser with Enhanced UX

## 📋 Document Information
- **Product**: Invoice Parser with Registration-First Authentication
- **Version**: 2.0
- **Date**: December 2024
- **Status**: Updated with Enhanced UX Requirements
- **Estimated Development Time**: 4-5 hours

## 🎯 Executive Summary

Transform the Invoice Parser into a registration-first application with a modern dark theme UI, modal-based authentication, and intelligent user journey management. Users will experience a streamlined onboarding flow that prioritizes registration, provides contextual navigation between processing and dashboard views, and maintains all uploaded files locally for enhanced privacy and performance.

### 🔍 Research Insights
Based on analysis of modern document processing applications (Expensify, Dext, DocuSign, Rossum), the enhanced UX follows industry best practices:
- **Registration-first onboarding** reduces friction and increases conversion
- **Modal-based authentication** maintains workflow continuity
- **Dark theme with violet accents** improves accessibility and professional appearance
- **Dashboard vs direct processing** adapts to user experience level
- **Local file storage** ensures privacy and faster processing

## 🚀 Product Objectives

### Primary Goals
1. **Registration-First Onboarding**: Landing page shows registration form with login option
2. **Intelligent User Journey**: Contextual navigation based on user experience (new vs returning)
3. **Modern Dark Theme UI**: Professional dark interface with violet accent colors
4. **Local File Management**: Store uploaded files in `./uploads` folder for privacy and performance
5. **Modal-Based Authentication**: Non-disruptive login/register flows
6. **Data Isolation**: Users can only access their own processed invoices

### Success Metrics
- **Onboarding Conversion**: >80% of visitors complete registration
- **User Journey Flow**: Seamless transition between registration → processing → dashboard
- **File Management**: All uploads stored locally with proper organization
- **UI/UX Quality**: Dark theme with consistent violet branding
- **Authentication Flow**: Modal-based auth without page redirects
- **Data Security**: Zero cross-user data leakage

## 👥 Target Users & User Journey

### Primary Users
- **Small Business Owners**: Need to process and track their invoices securely
- **Accountants**: Require organized access to client invoice data
- **Freelancers**: Want personal invoice processing and history tracking

### User Personas
1. **Sarah (Small Business Owner)**: Processes 10-20 invoices/week, needs organized history
2. **Mike (Accountant)**: Handles multiple clients, requires data separation
3. **Lisa (Freelancer)**: Occasional use, values simplicity and security

### 🎆 Detailed User Journey

#### **Step 1: Landing Experience**
- **New Visitor**: Sees registration form immediately upon landing at `http://127.0.0.1:8000`
- **Returning User**: Can click "Already have an account? Login" to access login modal
- **No Authentication Barriers**: No processing options visible until authenticated

#### **Step 2: Registration Flow**
- **Modal-Based**: Registration form opens in overlay modal
- **Minimal Fields**: Username, email, password (optional full name)
- **Auto-Login**: Successful registration automatically logs user in
- **Error Handling**: Clear validation messages for duplicate accounts

#### **Step 3: Login Flow**
- **Modal-Based**: Login form opens in overlay modal from landing page
- **Credential Validation**: Username/email + password authentication
- **Session Management**: JWT token stored locally for persistence
- **Error Handling**: Clear messages for invalid credentials

#### **Step 4: Post-Authentication Routing**

**For New Users (0 invoices processed):**
- **Direct to Processing**: Show invoice upload interface immediately
- **Welcome Message**: Brief onboarding tooltip explaining drag-and-drop
- **Clean Interface**: Focus on first invoice processing experience

**For Returning Users (1+ invoices processed):**
- **Dashboard First**: Show invoice history and statistics
- **Process More Option**: Prominent "Process New Invoice" button
- **Quick Actions**: Delete, re-download, view details for existing invoices

#### **Step 5: Invoice Processing**
- **File Upload**: Drag-and-drop or click to browse
- **Local Storage**: Files saved to `./uploads/[user_id]/[timestamp]_[filename]`
- **Real-time Processing**: AI extraction with progress indicators
- **Results Display**: Extracted data with edit/save options

#### **Step 6: Navigation States**
- **New Users**: Processing view → Dashboard (after first invoice)
- **Experienced Users**: Dashboard ⇌ Processing (toggle between views)
- **Logout**: Returns to registration landing page

#### **Step 7: Session Management**
- **Persistent Login**: JWT tokens with auto-refresh
- **Logout Flow**: Clear session and return to registration page
- **Session Expiry**: Graceful re-authentication prompts

## 🔧 Technical Requirements

### Frontend Architecture (Enhanced Single File)
- **File**: `static/index.html` (complete redesign with dark theme)
- **Framework**: Vanilla JavaScript with Tailwind CSS
- **Theme**: Dark theme with violet (#8B5CF6) accent colors
- **State Management**: LocalStorage for JWT tokens and user session
- **UI Components**: 
  - Modal-based authentication (no page redirects)
  - Contextual view switching (registration → processing → dashboard)
  - Drag-and-drop file upload with progress indicators
  - Responsive design for mobile and desktop

### Backend Architecture (Enhanced with File Management)
- **Existing Models**: UserModel, InvoiceModel with proper relationships
- **File Storage**: Local `./uploads/[user_id]/` directory structure
- **New API Endpoints**: 
  - `GET /api/user/invoice-count` - Check if user has processed invoices
  - `POST /api/files/upload` - Handle file upload to local storage
  - Enhanced dashboard endpoints for contextual routing
- **Enhanced Security**: JWT authentication, bcrypt password hashing, file access control

### File Management System
- **Storage Location**: `./uploads/[user_id]/[timestamp]_[original_filename]`
- **Access Control**: Users can only access their own uploaded files
- **File Cleanup**: Automatic cleanup of old files (configurable retention)
- **Supported Formats**: JPG, PNG, WEBP (existing validation)
- **Size Limits**: 10MB per file (existing validation)

## 📋 Functional Requirements

### 1. Landing Page Experience
**Feature**: Registration-first landing page
- **Default View**: Registration form prominently displayed
- **Login Option**: "Already have an account? Login" link
- **No Processing Access**: Invoice processing hidden until authenticated
- **Dark Theme**: Professional dark background with violet accents
- **Responsive**: Mobile-first design

### 2. Modal Authentication System
**Feature**: Non-disruptive authentication flows
- **Registration Modal**: 
  - Username, email, password, optional full name
  - Real-time validation feedback
  - Auto-login on successful registration
- **Login Modal**: 
  - Username/email and password fields
  - "Forgot password?" placeholder for future enhancement
  - Clear error messaging
- **Modal Behavior**: 
  - Backdrop click to close
  - ESC key support
  - Focus management
  - No page redirects

### 3. Contextual User Routing
**Feature**: Intelligent post-authentication navigation
- **New User Flow** (0 invoices):
  - Direct to processing interface
  - Welcome message with usage hints
  - Clean, focused upload area
- **Returning User Flow** (1+ invoices):
  - Dashboard with invoice history
  - "Process New Invoice" prominent button
  - Quick access to recent invoices

### 4. Enhanced File Management
**Feature**: Local file storage with user isolation
- **Upload Process**:
  - Drag-and-drop with visual feedback
  - Progress indicators during upload
  - File validation (type, size)
- **Storage Structure**: `./uploads/[user_id]/[timestamp]_[filename]`
- **Access Control**: Users can only access their own files
- **File Cleanup**: Configurable retention policies

### 5. Dark Theme UI System
**Feature**: Modern dark interface with violet branding
- **Color Palette**:
  - Background: Dark gray (#1F2937)
  - Cards/Panels: Darker gray (#111827)
  - Primary Accent: Violet (#8B5CF6)
  - Text: Light gray (#F9FAFB)
  - Success: Green (#10B981)
  - Error: Red (#EF4444)
- **Interactive Elements**:
  - Violet buttons for primary actions
  - Hover states with subtle animations
  - Focus indicators for accessibility

### 6. View State Management
**Feature**: Seamless navigation between app states
- **States**: Landing → Processing → Dashboard
- **Navigation**: Context-aware routing based on user status
- **Session Persistence**: Maintain state across browser sessions
- **Logout Flow**: Return to landing/registration page

### 7. Enhanced Dashboard
**Feature**: Comprehensive invoice management
- **Statistics Cards**: Total invoices, recent activity, success rate
- **Invoice History**: Paginated table with search/filter
- **Quick Actions**: View, delete, re-process invoices
- **File Access**: Download original uploaded files
- **Process More**: Prominent call-to-action for new invoices

## 🎨 User Experience Design

### 🎨 Dark Theme Design System

#### Color Palette
```css
:root {
  /* Background Colors */
  --bg-primary: #0F172A;      /* Main background */
  --bg-secondary: #1E293B;    /* Cards, panels */
  --bg-tertiary: #334155;     /* Elevated elements */
  
  /* Accent Colors */
  --accent-primary: #8B5CF6;  /* Violet - primary actions */
  --accent-hover: #7C3AED;    /* Violet hover state */
  --accent-light: #A78BFA;    /* Light violet - secondary */
  
  /* Text Colors */
  --text-primary: #F1F5F9;    /* Main text */
  --text-secondary: #CBD5E1;  /* Secondary text */
  --text-muted: #64748B;      /* Muted text */
  
  /* Status Colors */
  --success: #10B981;         /* Success states */
  --error: #EF4444;           /* Error states */
  --warning: #F59E0B;         /* Warning states */
  
  /* Border Colors */
  --border-primary: #475569;  /* Main borders */
  --border-secondary: #334155; /* Subtle borders */
}
```

#### Component Styling Guidelines
- **Buttons**: Violet gradient backgrounds with subtle shadows
- **Modals**: Dark panels with backdrop blur effects
- **Cards**: Elevated appearance with subtle borders
- **Forms**: Dark inputs with violet focus rings
- **Navigation**: Minimal dark header with violet accents

### Enhanced Frontend Structure
```html
<!-- Dark Theme index.html with Registration-First Flow -->
<body class="bg-primary text-primary">
  <!-- Minimal Header -->
  <header class="bg-secondary border-b border-primary">
    <div class="container mx-auto px-4 py-3">
      <h1 class="text-xl font-bold text-accent-primary">Invoice Parser</h1>
    </div>
  </header>
  
  <!-- Main Application States -->
  <div id="app-container" class="min-h-screen">
    
    <!-- Landing/Registration View (Default) -->
    <div id="landing-view" class="app-view">
      <!-- Registration form with login option -->
      <div class="registration-form bg-secondary">
        <!-- Dark themed registration interface -->
      </div>
    </div>
    
    <!-- Processing View (New Users) -->
    <div id="processing-view" class="app-view hidden">
      <!-- Dark themed upload interface -->
      <div class="upload-area bg-secondary border-accent-primary">
        <!-- Drag-and-drop with violet accents -->
      </div>
    </div>
    
    <!-- Dashboard View (Returning Users) -->
    <div id="dashboard-view" class="app-view hidden">
      <!-- Dark themed dashboard with violet highlights -->
      <div class="dashboard-grid">
        <!-- Statistics cards, invoice history -->
      </div>
    </div>
  </div>
  
  <!-- Modal Overlays with Dark Theme -->
  <div id="auth-modals" class="modal-container">
    <div id="login-modal" class="modal bg-secondary">
      <!-- Dark themed login form -->
    </div>
    <div id="register-modal" class="modal bg-secondary">
      <!-- Dark themed registration form -->
    </div>
  </div>
</body>
```

### User Flow
1. **First Visit**: See login/register options in header
2. **Registration**: Click register → modal form → account created → auto-login
3. **Login**: Click login → modal form → authenticated → access main app
4. **Processing**: Upload invoice → process (user-associated) → save to personal history
5. **Dashboard**: View personal invoice history, statistics, manage data

### UI States
- **Unauthenticated**: Login/Register buttons, limited functionality
- **Authenticated**: User menu, full functionality, dashboard access
- **Processing**: Loading states for auth operations
- **Error**: Clear error messages for auth failures

## 🔒 Security Requirements

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds (minimum 12)
- **JWT Tokens**: HS256 algorithm, 30-minute expiration
- **Token Storage**: localStorage with automatic cleanup
- **Session Validation**: Server-side token verification on protected routes

### Data Security
- **User Isolation**: Database-level filtering by user_id
- **Input Validation**: Sanitize all user inputs
- **SQL Injection Prevention**: Use parameterized queries (already implemented)
- **XSS Protection**: Escape user-generated content

### Privacy Requirements
- **Data Ownership**: Users own their processed invoices
- **Data Deletion**: Users can delete their own invoices
- **No Data Sharing**: Zero cross-user data visibility
- **Audit Trail**: Log authentication events

## 🗄️ Database Schema Changes

### New Tables
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    full_name VARCHAR(200),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add user_id to existing invoices table
ALTER TABLE invoices 
ADD COLUMN user_id UUID REFERENCES users(id) NOT NULL;

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_invoices_user ON invoices(user_id);
```

### Data Migration Strategy
- **Existing Data**: Create default admin user, assign existing invoices
- **New Installations**: Start fresh with user registration
- **Rollback Plan**: Remove user_id column, restore original functionality

## 🔌 API Specifications

### New Endpoints

#### Authentication Endpoints
```
POST /api/auth/register
- Body: {username, email, full_name?, password}
- Response: {access_token, token_type, user}
- Purpose: Registration with auto-login

POST /api/auth/login  
- Body: {username, password}
- Response: {access_token, token_type, user}
- Purpose: User authentication

GET /api/auth/me
- Headers: Authorization: Bearer <token>
- Response: {user_info}
- Purpose: Get current user profile

POST /api/auth/logout
- Headers: Authorization: Bearer <token>
- Response: {message}
- Purpose: Session cleanup
```

#### User Context Endpoints
```
GET /api/user/invoice-count
- Headers: Authorization: Bearer <token>
- Response: {count: number, has_invoices: boolean}
- Purpose: Determine user routing (processing vs dashboard)

GET /api/user/status
- Headers: Authorization: Bearer <token>
- Response: {is_new_user: boolean, recommended_view: string}
- Purpose: Contextual navigation decisions
```

#### File Management Endpoints
```
POST /api/files/upload
- Headers: Authorization: Bearer <token>
- Body: multipart/form-data with file
- Response: {file_id, file_path, original_name, size}
- Purpose: Store uploaded files in user-specific directory

GET /api/files/{file_id}
- Headers: Authorization: Bearer <token>
- Response: File stream
- Purpose: Secure file access (user can only access own files)

DELETE /api/files/{file_id}
- Headers: Authorization: Bearer <token>
- Response: {success: boolean, message: string}
- Purpose: File cleanup
```

#### Enhanced Dashboard Endpoints
```
GET /api/dashboard/invoices?page=1&limit=10&search=?
- Headers: Authorization: Bearer <token>
- Response: {invoices[], pagination, total, files[]}
- Purpose: Invoice history with associated file information

GET /api/dashboard/stats
- Headers: Authorization: Bearer <token>  
- Response: {total_invoices, success_rate, recent_activity, storage_used}
- Purpose: User statistics including file storage metrics

DELETE /api/dashboard/invoices/{invoice_id}
- Headers: Authorization: Bearer <token>
- Response: {message, files_deleted[]}
- Purpose: Invoice and associated file cleanup
```

#### Modified Processing Endpoints
```
POST /api/parse-invoice
- Headers: Authorization: Bearer <token> (required)
- Body: multipart/form-data with file
- Response: Enhanced with file_id and storage_path
- Purpose: Process invoice and store file locally

POST /api/save-invoice  
- Headers: Authorization: Bearer <token> (required)
- Body: Enhanced with file_id reference
- Purpose: Save processed data with file association
```

## 🎯 Implementation Phases

### Phase 1: Backend Enhancements (2 hours)
1. **File Management**: 
   - Create `./uploads` directory structure
   - Implement user-specific file storage
   - Add file access control and cleanup
2. **New API Endpoints**: 
   - User context endpoints (`/api/user/invoice-count`, `/api/user/status`)
   - File management endpoints (`/api/files/*`)
   - Enhanced dashboard endpoints with file references
3. **Database Updates**:
   - Add file reference fields to invoice model
   - Create file metadata tracking
   - Update existing endpoints for file association

### Phase 2: Frontend Complete Redesign (2.5 hours)
1. **Dark Theme Implementation**:
   - Complete color palette overhaul
   - Violet accent color system
   - Responsive dark theme components
2. **Landing Page Redesign**:
   - Registration-first interface
   - Modal-based authentication
   - Remove all processing UI from unauthenticated view
3. **Contextual Routing System**:
   - New user → processing flow
   - Returning user → dashboard flow
   - Seamless view transitions
4. **Enhanced File Upload**:
   - Improved drag-and-drop interface
   - Progress indicators and feedback
   - Local file management integration

### Phase 3: User Experience Polish (1 hour)
1. **Modal System**:
   - Accessibility improvements
   - Keyboard navigation
   - Focus management
2. **Animation & Transitions**:
   - Smooth view transitions
   - Loading states
   - Micro-interactions
3. **Mobile Optimization**:
   - Touch-friendly interfaces
   - Responsive modal behavior
   - Mobile file upload handling

### Phase 4: Testing & Validation (30 minutes)
1. **User Journey Testing**:
   - Complete registration → processing → dashboard flow
   - File upload and storage validation
   - Cross-browser compatibility
2. **Security Validation**:
   - File access control testing
   - User data isolation verification
   - Authentication flow security
3. **Performance Testing**:
   - File upload performance
   - Dark theme rendering
   - Mobile responsiveness

## 🧪 Testing Requirements

### Functional Testing
- [ ] User registration with validation
- [ ] User login with correct/incorrect credentials
- [ ] JWT token generation and validation
- [ ] Protected route access control
- [ ] Invoice processing with user association
- [ ] Dashboard data filtering by user
- [ ] Logout and session cleanup

### Security Testing
- [ ] Password hashing verification
- [ ] JWT token expiration handling
- [ ] Cross-user data access prevention
- [ ] Input validation and sanitization
- [ ] SQL injection prevention
- [ ] XSS protection

### UI/UX Testing
- [ ] Modal forms functionality
- [ ] Responsive design on mobile/desktop
- [ ] Loading states and error messages
- [ ] Navigation between views
- [ ] Session persistence across page reloads

## 📊 Success Criteria

### Technical Success
- [ ] All tests pass
- [ ] Zero security vulnerabilities
- [ ] Performance maintains current levels
- [ ] Database migration completes successfully

### User Experience Success
- [ ] Users can register/login in under 30 seconds
- [ ] Dashboard loads user data in under 2 seconds
- [ ] Invoice processing maintains current UX
- [ ] Error messages are clear and actionable

### Business Success
- [ ] User adoption rate > 80% for new sessions
- [ ] Zero cross-user data incidents
- [ ] Maintains current invoice processing accuracy
- [ ] Reduces support requests about data organization

## 🚨 Risk Assessment

### Technical Risks
- **Database Migration**: Risk of data loss during user_id addition
  - *Mitigation*: Comprehensive backup and rollback procedures
- **Frontend Complexity**: Single-file approach may become unwieldy
  - *Mitigation*: Modular JavaScript organization within single file
- **Security Vulnerabilities**: Authentication implementation errors
  - *Mitigation*: Use proven libraries, comprehensive security testing

### User Experience Risks  
- **Adoption Resistance**: Users may resist registration requirement
  - *Mitigation*: Clear value proposition, optional demo mode
- **Performance Impact**: Additional auth checks may slow processing
  - *Mitigation*: Efficient JWT validation, database indexing

### Business Risks
- **Data Privacy Concerns**: Users worried about data storage
  - *Mitigation*: Clear privacy policy, data deletion options
- **Support Complexity**: More complex system to maintain
  - *Mitigation*: Comprehensive documentation, error logging

## 📈 Future Enhancements (Out of Scope)

### Phase 2 Features (Future Releases)
- **Team Collaboration**: Share invoices with team members
- **API Access**: Developer API for third-party integrations
- **Advanced Analytics**: Detailed processing insights and trends
- **Email Notifications**: Processing completion alerts
- **Data Export**: Bulk export of user's invoice data
- **Mobile App**: Native mobile application
- **Enterprise Features**: SSO, admin panels, usage analytics

### Technical Improvements
- **Microservices**: Split auth service for scalability
- **Redis Caching**: Session and frequently accessed data caching
- **CDN Integration**: Static asset optimization
- **Database Sharding**: Scale for large user bases

## 📋 Acceptance Criteria

### Must Have (MVP)
- [ ] **Registration-First Landing**: Default page shows registration form
- [ ] **Modal Authentication**: Login/register in overlay modals (no page redirects)
- [ ] **Dark Theme UI**: Complete dark interface with violet (#8B5CF6) accents
- [ ] **Contextual User Routing**: 
  - New users (0 invoices) → Processing view
  - Returning users (1+ invoices) → Dashboard view
- [ ] **Local File Storage**: Files saved to `./uploads/[user_id]/` structure
- [ ] **Enhanced File Upload**: Drag-and-drop with progress indicators
- [ ] **User Data Isolation**: Users can only access their own files and data
- [ ] **Session Management**: JWT tokens with persistent login

### Should Have
- [ ] **Responsive Design**: Mobile-first dark theme interface
- [ ] **File Management**: Download original files, file cleanup
- [ ] **Enhanced Dashboard**: Statistics cards, search/filter, pagination
- [ ] **Error Handling**: Clear validation and error messages in dark theme
- [ ] **Accessibility**: Keyboard navigation, focus management, screen reader support
- [ ] **Performance**: Fast file uploads, smooth animations, optimized rendering
- [ ] **User Experience**: 
  - Welcome messages for new users
  - Contextual navigation hints
  - Smooth view transitions

### Could Have (Future Enhancements)
- [ ] **File Retention Policies**: Automatic cleanup of old files
- [ ] **Bulk Operations**: Multi-file upload and processing
- [ ] **Advanced Search**: Full-text search across invoice content
- [ ] **Export Features**: Bulk data export, PDF reports
- [ ] **Email Integration**: Email-to-upload functionality
- [ ] **API Rate Limiting**: Enhanced security for file uploads
- [ ] **User Profile Management**: Avatar upload, profile editing
- [ ] **Password Reset**: Email-based password recovery

### Technical Acceptance Criteria
- [ ] **File Security**: Users cannot access other users' files via URL manipulation
- [ ] **Storage Efficiency**: Proper file organization and cleanup mechanisms
- [ ] **Theme Consistency**: All UI elements follow dark theme design system
- [ ] **Modal Behavior**: Proper focus management, ESC key support, backdrop clicks
- [ ] **Error Recovery**: Graceful handling of network issues, file upload failures
- [ ] **Cross-Browser**: Works in Chrome, Firefox, Safari, Edge
- [ ] **Mobile Responsiveness**: Touch-friendly interface, proper viewport handling

## 📞 Stakeholder Sign-off

### Development Team
- **Backend Developer**: Responsible for auth services and database changes
- **Frontend Developer**: Responsible for UI implementation and integration
- **DevOps**: Responsible for deployment and security configuration

### Business Team
- **Product Owner**: Final approval on feature scope and priorities
- **Security Team**: Review and approval of authentication implementation
- **Support Team**: Training on new user management features

---

## 📝 Appendix

### Development Environment Setup
```bash
# Install additional dependencies
uv add python-jose[cryptography] passlib[bcrypt]

# Run database migrations
python -m app.core.database migrate

# Start development server
uvicorn app.main:app --reload
```

### Configuration Variables
```env
# Add to .env file
JWT_SECRET_KEY=your-super-secret-jwt-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Document Status**: ✅ Updated with Enhanced UX Requirements  
**Next Step**: Begin Phase 1 - Backend File Management & API Enhancements

---

## 🕰️ Change Log

### Version 2.0 Updates (December 2024)
- **Added**: Registration-first landing page requirement
- **Added**: Dark theme with violet accent color specifications
- **Added**: Local file storage system (`./uploads` directory)
- **Added**: Contextual user routing (new vs returning users)
- **Added**: Modal-based authentication (no page redirects)
- **Added**: Enhanced file management APIs
- **Added**: Comprehensive dark theme design system
- **Updated**: User journey flow with detailed step-by-step requirements
- **Updated**: Technical architecture for file storage and theme system
- **Updated**: Implementation phases to reflect enhanced scope
- **Research**: Incorporated best practices from Expensify, Dext, DocuSign analysis

### Key Architectural Changes
1. **Frontend**: Complete dark theme redesign with registration-first approach
2. **Backend**: Local file storage system with user-specific directories
3. **UX Flow**: Intelligent routing based on user experience level
4. **Authentication**: Modal-based, non-disruptive auth flows
5. **File Management**: Enhanced upload, storage, and access control systems

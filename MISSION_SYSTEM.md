# LAPD Mission Control System - Technical Documentation

## Overview
The LAPD Mission Control System provides a complete mission briefing management interface integrated into the Blade Runner 2049-themed desktop environment. It features GitHub OAuth authentication, real-time editing capabilities, and secure content storage.

## Features

### 🔐 GitHub OAuth Authentication
- **Secure Login**: GitHub OAuth 2.0 integration with state verification
- **Admin Access**: Only authenticated GitHub admin account can edit mission content
- **Session Management**: Secure cookie-based sessions with httpOnly and sameSite flags
- **Auto-Repository Creation**: Automatically creates private GitHub repository for mission storage

### 📋 Mission Management
- **Real-Time Editing**: Complete CRUD operations for mission briefings
- **Dynamic Content**: Edit title, classification, SWAT team, objectives, threat level, and description
- **Version Control**: All changes stored in private GitHub repository with commit history
- **Mobile-Friendly**: Responsive editing interface works on all devices

### 🎨 BR2049 Interface Design
- **LAPD Terminal Aesthetic**: Authentic Blade Runner 2049 command terminal styling
- **Classified Document UI**: Security classification levels, threat indicators
- **Film Grain Overlay**: Consistent visual texture matching desktop environment
- **Interactive Elements**: Hover effects, loading animations, success/error toasts

## Technical Architecture

### Components
```
src/components/
├── MissionBriefing.tsx     # Main mission interface component
├── MissionBriefing.css     # BR2049 terminal styling
└── AuthCallback.tsx        # GitHub OAuth callback handler
```

### Services
```
src/services/
├── authService.ts          # GitHub OAuth authentication logic
└── githubApiService.ts     # GitHub API integration for mission CRUD
```

### API Endpoints
```
api/mission/
└── current.ts              # Serverless endpoint for fetching mission data
```

## Mission Data Structure

### MissionData Interface
```typescript
interface MissionData {
  title: string;                                    // Mission operation name
  classification: 'UNCLASSIFIED' | 'CONFIDENTIAL'  // Security classification
                 | 'SECRET' | 'TOP SECRET';
  swatTeam: string[];                              // Team member names
  missionDate: string;                             // Mission date (2049.MM.DD format)
  description: string;                             // Multi-paragraph mission briefing
  objectives: string[];                            // Primary objectives list
  threatLevel: 'LOW' | 'MODERATE' | 'HIGH'        // Threat assessment level
              | 'CRITICAL';
  lastUpdated: string;                             // ISO timestamp of last edit
}
```

### Default Mission Content
The system includes a comprehensive default mission "Operation: Nexus Infiltration" featuring:
- Replicant investigation scenario
- Multiple SWAT team members
- Detailed threat assessment
- Complex multi-paragraph briefing
- 5 primary objectives

## Authentication Flow

### 1. Initial Access
- User clicks "ADMIN LOGIN" button in mission interface
- System redirects to GitHub OAuth authorization page
- User authorizes application access to their GitHub account

### 2. OAuth Callback
- GitHub redirects back with authorization code and state parameter
- `AuthCallback` component handles the token exchange securely
- System validates state parameter to prevent CSRF attacks

### 3. Session Management
- Successful authentication stores user data and access token
- Admin verification checks if user matches configured admin username
- Session persists across browser sessions until manual logout

### 4. Repository Access
- System automatically creates private repository if it doesn't exist
- All mission content stored as JSON in `current-mission.json`
- Version control tracks all changes with descriptive commit messages

## Security Features

### OAuth Security
- **State Parameter Verification**: Prevents CSRF attacks during OAuth flow
- **Secure Token Storage**: Access tokens stored securely in browser
- **Admin-Only Access**: Only configured admin GitHub username can edit content
- **Private Repository**: All mission data stored in private GitHub repository

### API Security
- **Server-Side Token Exchange**: Client never sees GitHub client secret
- **Personal Access Token**: Uses GitHub PAT instead of OAuth client secret for API calls
- **HTTPS Only**: All API communications encrypted in transit
- **Error Handling**: Proper error responses without exposing sensitive information

## Environment Configuration

### Required Environment Variables
```bash
# GitHub OAuth Configuration
VITE_GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_ACCESS_TOKEN=your_github_personal_access_token

# Admin Configuration
VITE_ADMIN_GITHUB_USERNAME=your_admin_github_username
VITE_GITHUB_REPO_NAME=mbpodcast-missions  # Repository name for mission storage
```

### Vercel Deployment Setup
1. **OAuth App Configuration**: Create GitHub OAuth App with callback URL pointing to your domain
2. **Environment Variables**: Set all required environment variables in Vercel dashboard
3. **Personal Access Token**: Generate GitHub PAT with repo permissions for API access
4. **Node.js Version**: Application requires Node.js 22.x (configured in package.json)

## User Interface Guide

### Mission Display Mode (Default)
- **Classification Header**: Shows security classification with color coding
- **Mission Metadata**: Team members, date, threat level with visual indicators
- **Briefing Content**: Multi-paragraph mission description
- **Objectives List**: Numbered primary objectives with BR2049 styling
- **Admin Controls**: Login button for non-authenticated users

### Edit Mode (Admin Only)
- **Dynamic Form Fields**: All mission properties become editable
- **Team Management**: Add/remove SWAT team members dynamically
- **Objective Management**: Add/remove/reorder mission objectives
- **Threat Level Selector**: Dropdown with visual threat level indicators
- **Save/Cancel Actions**: Persistent changes to GitHub repository

### Visual Feedback
- **Loading States**: "ACCESSING MISSION DATABASE..." with animated spinner
- **Success Messages**: Green toast notifications for successful saves
- **Error Handling**: Red error toasts with retry functionality
- **Authentication Status**: User avatar and name display when logged in

## Performance Optimizations

### Lazy Loading
- Mission editing interface components loaded on-demand
- Reduces initial bundle size for non-admin users
- OAuth callback component only loads when needed

### Caching Strategy
- Mission data cached with 60-second stale-while-revalidate
- Reduces GitHub API calls and improves response time
- Smart fallback to default mission if API unavailable

### Mobile Optimization
- Responsive design adapts to all screen sizes
- Touch-friendly interface elements
- Optimized for mobile editing workflows

## Troubleshooting

### Common Issues

**Build Errors with TypeScript**
- Ensure `@vercel/node` and `@types/node` dependencies are installed
- Check that setTimeout references use `ReturnType<typeof setTimeout>` type

**GitHub API 404 Errors**
- Verify GitHub Personal Access Token has correct repository permissions
- Check that admin GitHub username matches environment variable
- Ensure repository name is correctly configured

**OAuth Authentication Failures**
- Verify GitHub OAuth App callback URL matches deployment domain
- Check that client ID and secret are correctly set in environment
- Ensure state parameter validation is working correctly

**Mission Data Not Saving**
- Check browser network tab for API errors
- Verify admin authentication status
- Review GitHub API rate limits and permissions

### Debug Mode
Enable console logging for detailed debugging:
```javascript
// Add to localStorage in browser console
localStorage.setItem('debug-mission', 'true');
```

## Integration with Desktop Environment

### Dock Integration
- **5th Dock Button**: "Mission" button opens LAPD Mission Control window
- **Window Management**: Mission interface follows standard window behavior
- **Z-Index Handling**: Proper window focus and layering
- **BR2049 Styling**: Consistent visual theme with desktop environment

### Window Properties
- **Default Size**: 800x600px with responsive scaling
- **Positioning**: Smart positioning to avoid dock overlap
- **Scroll Handling**: Internal scrolling for long mission content
- **Close/Minimize**: Standard window controls with animation

## Future Enhancements

### Planned Features
- **Mission Templates**: Pre-defined mission templates for quick creation
- **Multi-Mission Support**: Support for multiple active missions
- **Audit Log**: Detailed change history with user attribution
- **Export Functionality**: PDF/print export for mission briefings
- **Team Assignment**: Integration with personnel database
- **Mission Status Tracking**: Active/completed/archived mission states

### Technical Improvements
- **Real-Time Collaboration**: Multi-user editing with conflict resolution
- **Offline Support**: Service worker caching for offline editing
- **Push Notifications**: Updates when mission content changes
- **Advanced Security**: Role-based permissions and access controls

---

## Recent Updates & Fixes (January 2025)

### SWAT Team Management Improvements
- **Enhanced Safety Checks**: Added comprehensive null/undefined array handling with `|| []` fallbacks
- **Button Type Fixes**: Added explicit `type="button"` attributes to prevent form submission conflicts
- **Improved State Management**: Robust array operations for adding/removing team members
- **User Experience**: Seamless add/remove functionality with proper React state updates

### UI/UX Optimizations
- **Window Sizing**: Reduced mission page height from 500px to 400px for better desktop integration
- **Responsive Design**: Improved mission window proportions within BR2049 desktop environment
- **Visual Balance**: Better harmony with dock and desktop elements

### Technical Improvements
- **Array Safety**: All SWAT team operations handle edge cases gracefully
- **Type Safety**: Proper TypeScript typing with fallback mechanisms
- **Build Stability**: Zero compilation errors with enhanced error handling
- **Performance**: Optimized re-rendering through proper state management

### Button Visibility & Interaction Fixes
- **Enhanced Add Button**: Bright cyan styling with larger size (12px font, 10px/16px padding)
- **Improved Remove Button**: Magenta-themed circular buttons (28x28px) with bold visibility
- **Better Visual Hierarchy**: Uppercase text, letter-spacing, and border-radius for professional look
- **Interactive Feedback**: Scale effects and color transitions on hover for clear user feedback
- **Accessibility**: Proper button types and enhanced contrast for better usability
- **Layout Optimization**: Improved spacing (12px gaps) and flex properties for better alignment

### SWAT Team Button Consistency
- **Unified Styling**: SWAT team add/remove buttons now match add/remove objective button styling exactly
- **Add Button**: Transparent background with dashed white border, 8px/16px padding, 11px font
- **Remove Button**: Circular 24x24px magenta-bordered buttons with hover fill effect
- **Visual Harmony**: Perfect consistency across all add/remove operations in mission interface
- **Professional Polish**: Subtle, clean styling that maintains BR2049 aesthetic throughout

### Window Sizing Optimization
- **Perfect Content Fit**: Mission window height optimized from 600px to 450px
- **Eliminated Waste Space**: Removed excessive empty area below mission content
- **Dual Configuration**: Updated both App.tsx window instances (720×450px) and CSS max-height (450px)
- **Improved UX**: Better proportions within BR2049 desktop environment
- **Content-First Design**: Window dimensions now precisely match actual content requirements

---

*This documentation covers the complete LAPD Mission Control System as of Phase 24 implementation with January 2025 improvements. The system demonstrates enterprise-grade authentication, content management, and user interface design within the Blade Runner 2049 aesthetic framework.*
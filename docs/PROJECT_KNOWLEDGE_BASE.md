# Behavior Support System - Project Knowledge Base (T:0)

## System Overview

The Behavior Support Request (BSR) System is a comprehensive school-focused platform designed to manage student behavioral incidents through a systematic workflow from incident reporting to resolution. The system provides role-based interfaces for Teachers, Administrators, and Students with real-time data synchronization.

## Current Build State (T:0)

### Production-Ready Features
- ✅ Full Supabase backend integration with PostgreSQL database
- ✅ Complete authentication system with role-based access control
- ✅ Real-time queue management with WebSocket subscriptions
- ✅ Multi-step behavior request creation workflow
- ✅ Student reflection system with kiosk interface
- ✅ Administrative dashboard with user management
- ✅ Session monitoring and analytics
- ✅ Responsive mobile and desktop design
- ✅ Professional typography and design system
- ✅ Comprehensive error handling and user feedback

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Teacher UI    │    │   Admin UI      │    │  Student Kiosk  │
│   Dashboard     │    │   Dashboard     │    │   Interface     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │            React Frontend Application           │
         │  • Context API for State Management            │
         │  • Custom Hooks for Data Operations            │
         │  • Real-time WebSocket Subscriptions           │
         └─────────────────────────────────────────────────┘
                                 │
         ┌─────────────────────────────────────────────────┐
         │              Supabase Backend                   │
         │  • PostgreSQL Database with RLS                │
         │  • Authentication & Authorization               │
         │  • Real-time Subscriptions                     │
         │  • Edge Functions for Business Logic           │
         └─────────────────────────────────────────────────┘
```

## Core Features

### 1. Authentication & User Management
- **Role-Based Access Control**: Teachers, Admins, Students
- **Supabase Authentication**: JWT-based with automatic token refresh
- **Profile Management**: User profiles with role assignments
- **Session Tracking**: Active session monitoring with device tracking

### 2. Teacher Dashboard
- **Real-Time Queue**: Live view of all behavior requests with status updates
- **BSR Creation**: Multi-step form for creating behavior support requests
  - Student selection with search functionality
  - Multiple behavior category selection with color coding
  - Mood assessment slider (Very Calm → Very Agitated)
  - Urgency marking with priority indicators
  - Notes and additional context
- **Queue Management**: View and manage all active requests
- **Reflection Review**: Review and provide feedback on student reflections
- **Live Timers**: Track time elapsed for each request
- **Status Tracking**: Real-time updates on request progress

### 3. Student Kiosk Interface
- **Secure Access**: Admin-only kiosk activation with student assignment
- **Four-Question Reflection**: Structured reflection process
  1. "What did you do that led to being sent out of class?"
  2. "What were you hoping would happen when you acted that way?"
  3. "Who else was impacted by your behavior, and in what way?"
  4. "Write two sentences showing you understand what's expected when you return to class."
- **Progress Tracking**: Visual progress indicator through reflection steps
- **Validation**: Required field validation for meaningful responses
- **Time Tracking**: Session duration monitoring

### 4. Administrative Dashboard
- **User Management**: Create, update, and manage user accounts
- **Kiosk Management**: Activate/deactivate kiosks and assign students
- **Session Monitoring**: Real-time view of active user sessions
- **Behavior History**: Complete historical data of all interventions
- **System Analytics**: User activity and system health metrics
- **Data Export**: Export behavior history and analytics

### 5. Real-Time Data Management
- **Queue Status Updates**: Live updates for all queue changes
- **Kiosk Status Synchronization**: Real-time kiosk availability
- **Session Monitoring**: Active user session tracking
- **Reflection Submissions**: Immediate reflection status updates

## User Workflows

### Teacher Workflow
1. **Login** → Teacher Dashboard
2. **Create BSR** → Select student → Choose behaviors → Set mood → Add notes → Submit
3. **Monitor Queue** → View real-time status → Review reflections → Provide feedback
4. **Approve Completion** → Mark intervention as complete

### Admin Workflow
1. **Login** → Admin Dashboard
2. **User Management** → Create/manage teacher and student accounts
3. **Kiosk Management** → Activate kiosks → Assign waiting students
4. **System Monitoring** → Track active sessions → Review system health
5. **Analytics Review** → Examine behavior patterns and trends

### Student Workflow
1. **Kiosk Assignment** → Admin assigns student to available kiosk
2. **Reflection Process** → Complete 4-question reflection form
3. **Submission** → Submit reflection for teacher review
4. **Return to Class** → Upon teacher approval

## Data Models

### Core Entities
```typescript
interface Student {
  id: string;
  name: string;
  grade: string;
  class_name: string;
}

interface BehaviorRequest {
  id: string;
  student_id: string;
  teacher_id: string;
  behaviors: string[];
  mood: string;
  urgent: boolean;
  status: 'waiting' | 'in_progress' | 'completed' | 'approved';
  kiosk_status: 'waiting' | 'ready' | 'in_progress';
  assigned_kiosk_id?: number;
  notes?: string;
}

interface Reflection {
  id: string;
  behavior_request_id: string;
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  status: 'pending' | 'reviewed' | 'approved';
  teacher_feedback?: string;
}

interface Kiosk {
  id: number;
  name: string;
  location: string;
  is_active: boolean;
  current_student_id?: string;
  current_behavior_request_id?: string;
}
```

### Behavior Categories
- **Disruptive** (Orange): Talking, interrupting, off-task behavior
- **Social-Emotional** (Pink): Emotional outbursts, social conflicts
- **Avoidance** (Green): Refusing work, shutting down
- **Eloping** (Blue): Leaving designated area without permission
- **Minor-Physical** (Purple): Minor physical contact
- **Major-Physical** (Red): Serious physical incidents requiring immediate attention

### Status Flow
```
BSR Creation → waiting → ready → in_progress → completed → approved
              ↓         ↓        ↓            ↓          ↓
            Queue    Kiosk    Reflection   Review    Archive
```

## Technical Implementation

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Tailwind CSS** with custom design system
- **React Router DOM** for client-side routing
- **React Query** for server state management
- **Custom Hooks** for business logic
- **Context API** for global state management

### Backend Integration
- **Supabase** as Backend-as-a-Service
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** for live updates
- **Edge Functions** for business logic
- **Authentication** with JWT tokens

### State Management
- **AuthContext**: User authentication and profile management
- **KioskContext**: Kiosk state and management
- **Custom Hooks**: Encapsulated data operations
- **React Query**: Server state caching and synchronization

### Design System
- **Professional Typography**: Inter font family with responsive hierarchy
- **Color Palette**: Semantic color tokens with HSL values
- **Behavior Colors**: Category-specific color coding
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Animations**: Smooth transitions and loading states

## Security & Data Protection

### Row Level Security (RLS)
- All database tables protected with RLS policies
- Role-based data access (Teachers can only see their data)
- Admin-only access to sensitive operations
- Student data protection with proper authorization

### Authentication Security
- JWT-based authentication with automatic refresh
- Session tracking with device identification
- Secure logout with session cleanup
- Role-based route protection

## Performance Optimizations

### Frontend Performance
- **Code Splitting**: Lazy loading of dashboard components
- **Memoization**: React.memo and useMemo for expensive operations
- **Optimized Rendering**: useCallback for event handlers
- **Efficient State Updates**: Batched updates and minimal re-renders

### Backend Performance
- **Database Indexing**: Optimized queries for common operations
- **Real-time Efficiency**: Targeted subscriptions for relevant data
- **Connection Pooling**: Efficient database connection management

## Development Workflow

### Code Organization
```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── AdminDashboard.tsx
│   ├── TeacherDashboard.tsx
│   └── KioskOne.tsx
├── contexts/            # React Context providers
├── hooks/               # Custom hooks
├── pages/               # Page-level components
├── integrations/        # External service integrations
└── lib/                # Utility functions
```

### Testing Strategy
- Component testing with React Testing Library
- Integration testing for user workflows
- E2E testing for critical paths
- Manual testing for UI/UX validation

## Deployment & Production

### Environment Configuration
- Production Supabase project configuration
- Environment-specific settings
- SSL/TLS security for data transmission
- CDN deployment for optimal performance

### Monitoring & Analytics
- Error tracking and logging
- Performance monitoring
- User analytics and behavior tracking
- System health dashboards

## Future Enhancements

### Planned Features
- **Advanced Analytics**: Detailed behavior pattern analysis
- **Reporting System**: Automated report generation
- **Parent Portal**: Parent visibility into student progress
- **Integration APIs**: Third-party system integration
- **Mobile App**: Native mobile application

### Technical Improvements
- **Offline Support**: PWA with offline capabilities
- **Advanced Search**: Full-text search with filters
- **Bulk Operations**: Batch data management
- **API Rate Limiting**: Enhanced security measures
- **Data Warehousing**: Long-term analytics storage

## Quick Reference

### Demo Credentials
```
Teacher Account:
Username: teacher@school.edu
Password: teacher123

Admin Account:
Username: admin@school.edu
Password: admin123
```

### Key File Locations
- **Main Application**: `src/App.tsx`
- **Authentication**: `src/contexts/AuthContext.tsx`
- **Teacher Dashboard**: `src/components/TeacherDashboard.tsx`
- **Admin Dashboard**: `src/components/AdminDashboard.tsx`
- **Kiosk Interface**: `src/components/KioskOne.tsx`
- **Database Types**: `src/integrations/supabase/types.ts`
- **Design System**: `src/index.css`

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Current Status
- **Platform**: Lovable Development Environment
- **Version**: T:0 (Initial Release)
- **Backend**: Fully configured Supabase project
- **Frontend**: Complete React application
- **Status**: Production-ready for deployment
- **Last Updated**: Current date

This system represents a complete, production-ready behavior support platform ready for school implementation with comprehensive features, security, and scalability built in from the ground up.
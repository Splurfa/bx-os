# Technical Reference

## Overview

Technical documentation for BX-OS architecture, APIs, and development context.

## Documentation Structure

### [Architecture Overview](ARCHITECTURE.md)
- System component relationships
- Database schema and relationships  
- Authentication and authorization flow
- Real-time update mechanisms

### [API Reference](API-REFERENCE.md)
- Supabase table schemas
- Database functions and triggers
- Row Level Security policies
- Real-time subscription patterns

### [Component Documentation](COMPONENTS.md)
- React component architecture
- Hook patterns and state management
- Route protection implementation
- UI component library usage

### [Development Context](DEVELOPMENT-CONTEXT.md)
- Technology stack overview
- Build and deployment process
- Environment configuration
- Testing and validation procedures

## Quick References

### Database Tables
- `profiles` - User profile and role information
- `students` - Student demographic and grade data
- `behavior_support_requests` - BSR tracking and metadata
- `queue_items` - Real-time queue management
- `active_sessions` - Device and session tracking

### Key Components
- `AdminRoute` / `TeacherRoute` - Role-based route protection
- `usePermissions` - Authorization hook
- `useSupabaseQueue` - Real-time queue management
- `NotificationBell` - System notifications

### Authentication Flow
1. Google OAuth via Supabase Auth
2. Automatic profile creation with default role
3. Role-based route access enforcement
4. Anonymous kiosk access (no authentication required)

---

*For implementation details, see individual reference documents.*
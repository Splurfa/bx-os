# BX-OS Custom Project Knowledge

## System Identity & Architecture

### Project Overview
**BX-OS** is a production-ready behavior management platform designed for middle school environments. The system facilitates a structured workflow where teachers create Behavior Support Requests (BSRs), students complete reflections at dedicated kiosks, and administrators maintain oversight of the entire process.

### Core Architecture
- **Three-tier access model**: Anonymous kiosk access, authenticated teacher dashboard, administrative oversight
- **Route structure**: 
  - `/kiosk1`, `/kiosk2`, `/kiosk3` - Anonymous student access
  - `/teacher` - Teacher dashboard with BSR creation and queue monitoring
  - `/admin-dashboard` - Administrative oversight and user management
- **Real-time synchronization**: Live queue updates, instant kiosk assignments, notification delivery
- **Mobile-first design**: Optimized for iPad kiosk stations and mobile teacher access

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS with semantic tokens
- **Backend**: Supabase (PostgreSQL + real-time subscriptions + authentication)
- **Security**: Row-Level Security policies + Google OAuth integration
- **State Management**: React Query for server state, React Context for auth
- **UI Components**: shadcn/ui with custom design system variants

### Data Model
- **159 middle school students** with family/guardian relationships
- **15+ database tables** with comprehensive RLS policies
- **Validated workflow patterns** with automatic assignment logic
- **Real-time queue management** with conflict prevention

## Operational Knowledge

### User Roles & Permissions Hierarchy
```
super_admin > admin > teacher > anonymous (kiosk)
```

**Teacher Permissions:**
- Create/view own BSRs
- Monitor assigned student reflections
- Access student data for their requests
- Clear their own queue

**Admin Permissions:**
- All teacher permissions +
- View all BSRs system-wide
- Manage user accounts and roles
- Clear all queues globally
- System configuration access

**Super Admin Permissions:**
- All admin permissions +
- Database management
- CSV import functionality
- System-level configuration

### Workflow Patterns
1. **BSR Creation**: Teacher identifies student behavior → Creates BSR with details
2. **Automatic Assignment**: System assigns student to available kiosk (1-3)
3. **Student Reflection**: 15-20 minute guided reflection process
4. **Teacher Review**: Teacher receives notification → Reviews reflection → Provides feedback
5. **Resolution**: Complete cycle with optional family notification

### Security Model
- **Anonymous kiosk access**: No authentication required for student reflections
- **Google OAuth staff authentication**: Automatic profile creation with role assignment
- **Row-Level Security**: Database-level access control based on user relationships
- **Real-time permissions**: Dynamic UI rendering based on user capabilities

### Deployment Context
- **iPad kiosk stations**: Touch-optimized interfaces in classroom/office settings
- **Mobile teacher access**: Responsive design for phone/tablet usage
- **Real-time notifications**: Audio + visual alerts for new assignments
- **Session management**: Device-specific kiosk sessions with fingerprinting

## Development & Collaboration Context

### Code Patterns
- **Component architecture**: Focused, single-responsibility components
- **Custom hooks**: `usePermissions`, `useProfile`, `useSupabaseQueue` for state management
- **Route protection**: `AdminRoute`, `TeacherRoute` components with role validation
- **Real-time subscriptions**: Supabase channels for live data synchronization

### Quality Standards
- **Production-ready documentation**: Comprehensive technical references and user guides
- **Evidence-based validation**: Direct database queries and runtime verification
- **Iterative refinement**: Methodical testing and improvement cycles
- **Role-based user thinking**: Design decisions made from specific user perspectives

### Problem-Solving Approach
1. **Direct inspection**: Database queries, console logs, network requests
2. **Code verification**: Read existing implementations before modifications
3. **Real-world testing**: Validate changes with actual user scenarios
4. **Documentation first**: Clear plans before implementation

### Communication Preferences
- **Clear plans before implementation**: Outline approach and get approval
- **Evidence over assumptions**: Verify claims with actual system queries
- **Role-based user thinking**: Consider impact on each user type
- **Minimal viable changes**: Focus on specific requests without scope creep

## Implementation Guidelines

### Authentication Flow
```
Google OAuth → Supabase Auth → Profile Creation → Role Assignment → Route Access
```
- Automatic profile creation via database trigger
- Role assignment based on email domain patterns
- Session persistence across browser refreshes
- Real-time role change detection

### Database Patterns
- **Row-Level Security**: Every table has appropriate access policies
- **Real-time subscriptions**: Live updates for queue changes and assignments
- **Conflict prevention**: Database functions prevent data inconsistencies
- **Audit logging**: Session tracking and security event recording

### UI/UX Principles
- **Mobile-first design**: Touch-friendly interfaces with proper sizing
- **Role-specific interfaces**: UI adapts based on user permissions
- **Real-time feedback**: Immediate visual confirmation of actions
- **Semantic design tokens**: HSL colors via design system, no direct color usage

### Testing & Validation
- **Direct queries**: Use Supabase console for data verification
- **Runtime verification**: Console logs and network request monitoring
- **Cross-role functionality**: Test features across different user types
- **Edge case handling**: Validate error states and boundary conditions

## System Capabilities (Verified Working)

### High Confidence (Production Ready)
- ✅ Role-based dashboard access control
- ✅ Anonymous kiosk route access  
- ✅ Google OAuth user creation and profile assignment
- ✅ Component-level permission checking system
- ✅ Multi-role hierarchical access (super_admin > admin > teacher)
- ✅ Real-time queue management with automatic assignments
- ✅ Notification system with audio/visual alerts
- ✅ Student data population with family relationships

### Medium Confidence (Infrastructure Present)
- ⚠️ Route security enforcement across application
- ⚠️ Session correlation between authenticated users  
- ⚠️ Permission-aware UI component rendering
- ⚠️ Complex user workflow edge cases

### Requires Ongoing Monitoring
- 🔄 Concurrent multi-user access patterns
- 🔄 Session persistence across browser refreshes
- 🔄 Error handling for authentication failures
- 🔄 Real-time subscription performance under load

## Collaboration Framework

This knowledge base establishes our shared understanding of:
- **What BX-OS is**: A production behavior management platform
- **How it works**: Role-based workflows with real-time coordination
- **Why it's built this way**: School environment requirements and user safety
- **How we work together**: Evidence-based, methodical development approach

When working on BX-OS, always consider:
1. **User safety**: Students, teachers, and administrators depend on reliable functionality
2. **Real-world constraints**: iPad interfaces, network reliability, user technical skills
3. **Security requirements**: Student data protection and access control
4. **Scalability**: System designed for school-wide deployment

---

*This knowledge base reflects the current state of BX-OS as of January 2025 and our established development methodology.*
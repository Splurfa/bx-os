# BX-OS: Behavioral Intelligence Platform

A simplified, mobile-first behavioral support system designed for middle school environments. Built with React, TypeScript, and Supabase for real-time collaboration and data management.

## 🎯 Current Status: IMPLEMENTATION READY

**Last Updated**: August 19, 2025  
**Architecture**: Simplified for dedicated iPad deployment  
**Target**: 159 middle school students (6th-8th grade)

### ✅ System Foundation
- **Database**: Complete schema with proper relationships
- **Authentication**: Google OAuth operational for staff access
- **Anonymous Access**: Kiosk routes available without authentication
- **Mobile Interface**: Tablet-optimized for dedicated iPads
- **Real-Time Features**: Supabase subscriptions operational

## 🚀 Simplified Architecture

### Core Design Principles
- **Dedicated iPads**: 3 static kiosks with fixed URLs
- **Single School**: Designed for one middle school deployment
- **Grade Filtering**: Only 6th-8th grade students (159 total)
- **Static Configuration**: No complex device detection or sessions
- **Reliable Queue Management**: Simple, effective notification system

### Implementation Plan (6 hours total)

#### Phase 1: Security & Grade Filtering (2 hours)
- Update RLS policies for anonymous kiosk access
- Implement 6th-8th grade filtering
- Validate AdminRoute/TeacherRoute protection
- Test anonymous access to static kiosk URLs

#### Phase 2: Simplified Kiosk System (2 hours)
- Replace complex device sessions with static URLs
- Remove device fingerprinting and dynamic routing
- Update admin dashboard for tech team configuration
- Clean up unused components

#### Phase 3: Queue Management Fixes (1 hour)
- Debug `admin_clear_all_queues()` function
- Fix student lookup field references
- Test real-time queue updates
- Validate history preservation

#### Phase 4: Data Integration Preparation (1 hour)
- Filter dataset to middle school only
- Validate schema for school system integration
- Test complete workflows
- Document integration points

## 🔐 Access Patterns

### Staff Authentication (Google OAuth)
```
Admin Dashboard: /admin
- Full system oversight
- User management
- Queue clearing controls

Teacher Dashboard: /teacher  
- Behavior request review
- Student reflection tracking
- Real-time notifications
```

### Student Anonymous Access
```
Kiosk URLs (for tech team iPad configuration):
- /kiosk/1 - Kiosk One (anonymous)
- /kiosk/2 - Kiosk Two (anonymous) 
- /kiosk/3 - Kiosk Three (anonymous)

Students access: Self-reflection → Behavior selection → Mood tracking
```

## 📊 Target Deployment

### School Environment
- **Middle School Only**: Grades 6-8
- **Student Population**: 159 students
- **Device Strategy**: 3 dedicated iPads
- **Network**: School WiFi with static kiosk URLs
- **Staff Access**: Desktop/mobile for teachers and admins

### Success Metrics
- Students can complete reflections without authentication barriers
- Teachers receive real-time notifications of behavior requests
- Admins can clear queues reliably while preserving history
- All interfaces responsive on target devices
- Clean foundation ready for school data integration

## 🗂️ PROJECT STRUCTURE

```
src/
├── components/           # UI components
│   ├── ui/              # shadcn/ui components
│   ├── Kiosk*/          # Static kiosk interfaces
│   ├── AdminRoute.tsx   # Role-based protection
│   ├── TeacherRoute.tsx # Role-based protection
│   └── *Dashboard/      # Role-specific dashboards
├── contexts/            # React contexts (Auth, Kiosk)
├── hooks/               # Custom hooks (Supabase data, queues)
├── pages/               # Route components
└── integrations/        # Supabase client & types

SPRINT-01-LAUNCH/        # Current implementation documentation
Docs/                    # System architecture & protocols
```

## 🔧 TECHNICAL FOUNDATION

### Working Systems
- Database schema with proper relationships and constraints
- Mobile-responsive UI components across device types
- PWA infrastructure for installation and offline capability
- Supabase integration with real-time subscriptions
- Google OAuth authentication for staff

### Implementation Focus
- **Simplicity Over Complexity**: Static URLs instead of dynamic sessions
- **Reliability Over Features**: Robust queue clearing with history preservation
- **Accessibility Over Barriers**: Anonymous kiosk access for students
- **Foundation Over Optimization**: Clean architecture for future enhancement

## 📚 DOCUMENTATION

- `SPRINT-01-LAUNCH/` - Current implementation sprint
- `Docs/` - System architecture and development protocols
- `Docs/Flowcharts/` - Visual system architecture diagrams

---

**Next Sprint Preparation**: School system data integration and enrollment synchronization
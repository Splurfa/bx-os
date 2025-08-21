# 🔧 BX-OS Technical Context - SPRINT-02-LAUNCH

## 🏗️ TECHNICAL ARCHITECTURE

### System Foundation
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Database + Auth + Real-time)
- **Styling**: Tailwind CSS with design system
- **Deployment**: Lovable hosting platform

### Database Architecture
- **Students**: Core student records with grade-level filtering
- **Queue**: Real-time student behavior reflection queue
- **Profiles**: User management for admin/teacher roles
- **BSR Records**: Behavior Support Request tracking

### Authentication System
- **Provider**: Google OAuth via Supabase
- **Roles**: Admin/Teacher binary distinction
- **Protection**: Route-based access control
- **Anonymous Access**: Kiosk routes bypass authentication
- **✅ Notification System**: Bell dropdown, audio/push notifications, user preference controls operational

## 📊 DEPLOYMENT CONSTRAINTS

### Hardware Context
- **Target Devices**: 3 dedicated iPads in fixed locations
- **Network**: School WiFi environment
- **Access Pattern**: Static URLs for consistent setup

### Simplification Strategy
- Remove device fingerprinting complexity
- Use static routing instead of dynamic assignment
- Filter data to single school, middle school only
- Maintain essential functionality while reducing complexity

---

**TECHNICAL APPROACH**: Architectural simplification for reliability and maintainability in single-school deployment context. Notification system complete, pending 4 pre-deployment bugs (Force logout, dashboard integrity, urgent highlighting, Slack integration).
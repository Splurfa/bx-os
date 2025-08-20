# 📊 System Architecture & User Journey Flowcharts

This folder contains visual diagrams mapping the BX-OS system architecture, user flows, and technical journeys. Flowcharts are organized by purpose and timeline to support sprint planning, architecture decisions, and stakeholder communication.

## 📁 Organization Structure

### 🔴 Current-State/
**Purpose**: Document existing system problems and architectural gaps
- `01-current-authentication-routing.md` - Broken auth & role-based routing flows
- `02-current-kiosk-logic.md` - Static route kiosk implementation issues
- `03-current-database-schema.md` - Complete ER diagram of existing tables
- `04-current-session-management.md` - Broken session tracking & user correlation

### 🟢 Sprint-02-Targets/
**Purpose**: Document target state deliverables for current sprint (Simplified Implementation)
- `05-updated-authentication.md` - Role-based routing & anonymous kiosk access
- `06-simplified-kiosk-system.md` - Static URL system for 3 dedicated iPads
- `07-updated-queue-management.md` - Fixed end-to-end queue workflow
- `08-middle-school-filtering.md` - Student filtering & data management system

### 🟣 Future-Vision/
**Purpose**: Document long-term architectural vision beyond current sprint
- `09-scalable-single-school-architecture.md` - Enhanced single-school deployment
- `10-behavior-analytics-enhancement.md` - AI analysis & pattern recognition
- `12-school-system-integration.md` - External system integrations

### 🎯 User-Journeys/
**Purpose**: Document complete user experience flows across all stakeholders
- `11-complete-student-journey.md` - Student behavior support journey from kiosk to resolution
- `12-teacher-workflow-journey.md` - Teacher BSR creation to student review workflow
- `13-admin-oversight-journey.md` - Administrative oversight and system management

## 🎨 Color Legend
- 🔴 **Red**: Problematic/broken areas requiring immediate fixes
- 🟢 **Green**: Sprint deliverable functionality (achievable this sprint)
- 🟣 **Purple**: Future vision (beyond current sprint)
- 🔵 **Blue**: Security/compliance layers
- ⚪ **White**: Existing functional components

## 📋 Usage Guidelines

### For Sprint Planning
- Use **Current-State** diagrams to identify problems requiring fixes
- Reference **Sprint-Targets** to understand deliverable scope and dependencies
- Consult **Future-Vision** to ensure current decisions align with long-term architecture

### For Development
- **Current-State** diagrams show what needs to be replaced or fixed
- **Sprint-Targets** provide implementation blueprints and technical specifications
- Refer to these for understanding data flow, component relationships, and security requirements

### For Stakeholder Communication
- **User-Journeys** provide high-level experience flows for non-technical audiences
- **Current-State** demonstrates problems being solved
- **Sprint-Targets** show concrete improvements being delivered

## 🔗 Cross-References
- Sprint documentation: `SPRINT-02-LAUNCH/README.md`
- Implementation details: `SPRINT-02-LAUNCH/IMPLEMENTATION-CHECKLIST.md`
- Technical context: `SPRINT-02-LAUNCH/BX-OS-TECHNICAL-CONTEXT.md`
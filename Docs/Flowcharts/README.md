# 📊 System Architecture & User Journey Flowcharts

This folder contains visual diagrams mapping the BX-OS system architecture, user flows, and technical journeys. Flowcharts are organized by purpose and timeline to support sprint planning, architecture decisions, and stakeholder communication.

## 📁 Organization Structure

### 🔴 Current-State/
**Purpose**: Document existing system problems and architectural gaps
- `01-current-authentication-routing.md` - Broken auth & role-based routing flows
- `02-current-kiosk-logic.md` - Static route kiosk implementation issues
- `03-current-database-schema.md` - Complete ER diagram of existing tables
- `04-current-session-management.md` - Broken session tracking & user correlation

### 🟢 Sprint-01-Targets/
**Purpose**: Document target state deliverables for current sprint
- `05-updated-authentication.md` - Role-based routing & anonymous kiosk access
- `06-device-instance-management.md` - Dynamic kiosk assignment system
- `07-updated-kiosk-workflow.md` - Fixed end-to-end kiosk user journey
- `08-fixed-session-management.md` - Corrected session architecture

### 🟣 Future-Vision/
**Purpose**: Document long-term architectural vision beyond current sprint
- `09-scalable-kiosk-architecture.md` - Multi-school deployment vision
- `10-behavior-analytics-flow.md` - AI analysis & pattern recognition
- `12-system-integration-architecture.md` - External system integrations

### 🎯 User-Journeys/
**Purpose**: Document complete user experience flows across all stakeholders
- `11-user-journey-map.md` - Complete student behavior support journey

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
- Sprint documentation: `SPRINT-[NAME]/README.md`
- Implementation details: `SPRINT-[NAME]/IMPLEMENTATION-CHECKLIST.md`
- Technical context: `SPRINT-[NAME]/BX-OS-TECHNICAL-CONTEXT.md`
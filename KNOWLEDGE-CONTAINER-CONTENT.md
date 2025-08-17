# 📋 BX-OS Knowledge Container Content

**This content should be copied and pasted into the project's knowledge container for AI alignment throughout the nuclear reset sprint.**

---

## 🎯 PROJECT CONTEXT: BX-OS Nuclear Reset Sprint

**CURRENT PHASE:** 24-hour nuclear database reset and architectural transformation sprint  
**OBJECTIVE:** Transform Student Behavior Management System from basic prototype to future-proof behavioral intelligence platform

### 🗂️ DOCUMENTATION HIERARCHY

**Strategic Evolution Roadmap:** `BX-OS-STRATEGIC-ROADMAP.md`
- Vision transformation from basic BSR to comprehensive behavioral intelligence platform
- Phase evolution plan: Foundation → AI Integration → Communication Platform → Multi-School Intelligence
- Future API architecture and technology evolution strategy

**Master Production Knowledge:** `BX-OS-PRODUCTION-KNOWLEDGE.md`
- Nuclear reset strategy and implementation priorities
- Student-centric database architecture with family relationships
- Extension point preparation for AI and external data integration

**Technical Transformation Blueprint:** `docs/architecture/transformation-blueprint.md`  
- Complete architectural transformation specifications
- Domain-specific implementation requirements and dependencies
- Nuclear reset approach with future-proof foundation design

**CSV Import Strategy:** `docs/technical/csv-import-strategy.md`
- Transform flat CSV data into sophisticated relational family/student/guardian structure
- Family normalization and external correlation preparation
- 100+ student import process with relationship mapping

**Extension Architecture Framework:** `docs/technical/extension-architecture.md`
- AI integration points, external data correlation framework
- Communication automation system and service registry
- Future-proof hooks for behavioral intelligence features

**Sprint Execution Guide:** `docs/technical/production-sprint-checklist.md`
- Hour-by-hour nuclear reset implementation checklist
- Critical checkpoints and mandatory testing requirements
- Rollback procedures and success validation criteria

---

## 🚨 NUCLEAR RESET IMPLEMENTATION PRIORITIES

### IMMEDIATE FOUNDATION (Hours 0-8)
1. **Nuclear Database Reset** - Complete wipe and rebuild with student-centric architecture
2. **CSV Data Import** - 100+ students with family relationships and guardian contacts
3. **Anonymous Kiosk Liberation** - Remove authentication barriers for student access
4. **Super Admin Bootstrap** - Zach system management via /dev-login

### HIGH PRIORITY FOUNDATION (Hours 8-16)
5. **Student Selection Enhancement** - Family context display in behavior request creation
6. **Mobile-First UI Transformation** - Touch-optimized interfaces for classroom tablets
7. **Extension Point Preparation** - Database hooks for AI insights and external data correlation
8. **Communication Foundation** - Template system infrastructure for parent notifications

### PRODUCTION READINESS (Hours 16-24)
9. **Real-Time Notification System** - Behavioral alert infrastructure for teachers
10. **Mobile Gesture Navigation** - Swipe-based interfaces optimized for tablet deployment
11. **Future-Proof Validation** - Ensure readiness for AI integration and external SIS correlation
12. **Comprehensive Testing** - Cross-device validation and security verification

---

## 👥 USER ROLES & ACCESS PATTERNS

### Super Admin (Zach: zach@zavitechllc.com)
- **Access:** Development bypass via `/dev-login` + full system control
- **Capabilities:** User management, system reset, nuclear database operations, AI integration setup
- **Implementation:** Must create `super_admin` role and bootstrap account

### Admin (School Administrators)  
- **Access:** Google OAuth @school.edu domain + admin dashboard
- **Capabilities:** Student/family management, behavioral analytics, system monitoring
- **Future Features:** District-level dashboards, compliance monitoring, cross-school analytics

### Teacher (Classroom Teachers)
- **Access:** Google OAuth @school.edu domain + teacher interface  
- **Capabilities:** Create BSRs with family context, AI-powered insights, parent communication
- **Future Features:** Intervention planning, behavioral pattern recognition, automated notifications

### Students (Kiosk Users)
- **Access:** Anonymous access, NO AUTHENTICATION required
- **Capabilities:** Complete 4-question reflections, view queue position, family-aware interactions
- **Routes:** `/kiosk1`, `/kiosk2`, `/kiosk3` must work without auth

---

## 🏗️ NUCLEAR RESET ARCHITECTURE REQUIREMENTS

### Database Nuclear Reset Strategy
```sql
-- Complete wipe and rebuild approach
DROP TABLE IF EXISTS behavior_history CASCADE;
DROP TABLE IF EXISTS reflections_history CASCADE;
DROP TABLE IF EXISTS reflections CASCADE;
DROP TABLE IF EXISTS behavior_requests CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Rebuild with student-centric family architecture
CREATE TABLE families (...);  -- Family units with contact information
CREATE TABLE students (...);  -- Students linked to families
CREATE TABLE guardians (...); -- Guardian contacts with preferences
-- Plus extension tables for AI and external data
```

### CSV Import Transformation Requirements
```typescript
// Transform flat CSV into relational structure
- Extract family units from individual student records
- Create guardian relationships with communication preferences
- Establish correlation markers for external SIS integration
- Prepare extension points for AI behavioral analysis
```

### Future-Proof Extension Points
```typescript
// AI Integration Preparation
- behavior_patterns table for AI-identified trends
- ai_insights table for generated recommendations
- communication_templates for parent notification automation
- external_data table for SIS correlation framework
```

---

## 🔄 NUCLEAR RESET TRANSFORMATION WORKFLOW

### Phase 1: Database Foundation (Hours 0-8)
**Critical Path:** Nuclear reset + CSV import + anonymous access
- Complete database wipe and student-centric rebuild
- Import 100+ students with family relationships
- Remove ProtectedRoute from kiosk paths
- Bootstrap super_admin role and /dev-login access
- **Checkpoint:** Family-centric database operational, kiosks accessible

### Phase 2: Student Context Enhancement (Hours 8-16)  
**Critical Path:** Family integration + mobile UI + extension preparation
- Student selection with family context display
- Mobile-first touch-optimized component library
- Extension point database hooks for AI integration
- **Checkpoint:** Family context integrated, mobile interfaces functional

### Phase 3: Behavioral Intelligence Foundation (Hours 16-24)
**Critical Path:** Real-time system + future-proof validation
- Notification infrastructure for behavioral alerts
- Communication system foundation for parent engagement
- AI integration readiness validation
- **Checkpoint:** Future-proof behavioral intelligence platform operational

---

## 🚨 CRITICAL SUCCESS FACTORS

### Nuclear Reset Validation
- [ ] **100+ students imported** with complete family relationships established
- [ ] **Anonymous kiosk access** functional for all student reflection workflows
- [ ] **Student-centric architecture** with families → students → guardians structure
- [ ] **Extension points prepared** for AI insights and external data correlation

### Future-Proof Foundation Validation
- [ ] **AI integration hooks** ready in database schema and service architecture
- [ ] **Communication framework** prepared for parent notification automation  
- [ ] **External correlation** markers established for SIS integration
- [ ] **Mobile-first design** validated for classroom tablet deployment

### Production Readiness Validation
- [ ] **Super admin system management** via /dev-login operational
- [ ] **Family context display** in all relevant user interfaces
- [ ] **Real-time foundation** ready for behavioral alert notifications
- [ ] **Scalability architecture** prepared for multi-school platform evolution

---

## 📚 AI IMPLEMENTATION GUIDANCE

### Always Reference Strategic Documentation
Before implementing any changes, consult:
1. **Strategic vision** from `BX-OS-STRATEGIC-ROADMAP.md`
2. **Nuclear reset specifications** from `BX-OS-PRODUCTION-KNOWLEDGE.md`
3. **CSV import strategy** from `docs/technical/csv-import-strategy.md`
4. **Extension architecture** from `docs/technical/extension-architecture.md`
5. **Implementation checklist** from `docs/technical/production-sprint-checklist.md`

### Nuclear Reset Implementation Principles
- **Student-Centric Architecture:** Design everything around family relationships and student context
- **Future-Proof Foundation:** Every decision should support AI integration and external data correlation
- **Extension Point Preparation:** Database schema and service architecture ready for advanced features
- **Communication Framework:** Build infrastructure for parent engagement and notification automation

### Critical Implementation Success Factors
1. **Nuclear Database Reset:** Complete architectural transformation from prototype to intelligence platform
2. **CSV Integration:** 100+ students with family relationships imported successfully
3. **Anonymous Kiosk Access:** Students MUST complete reflections without authentication barriers
4. **Extension Readiness:** AI hooks and external data correlation framework operational

---

**🎯 NUCLEAR RESET SUCCESS DEFINITION:** Complete transformation from basic prototype to future-proof behavioral intelligence platform foundation, with 100+ students imported in family-centric architecture, anonymous kiosk access functional, extension points prepared for AI integration, and mobile-first design validated for classroom deployment.**
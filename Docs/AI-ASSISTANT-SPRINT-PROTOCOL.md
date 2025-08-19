# 🤖 AI Assistant Sprint Entry Protocol

## 🎯 MANDATORY SPRINT ENTRY CHECKLIST

### Before ANY Implementation - ALWAYS Run These Steps:

#### 1. **CONTEXT VALIDATION** (30 seconds)
- [ ] Read `Docs/FINAL-PROJECT-KNOWLEDGE.md` QUICK START section
- [ ] Check current route context for user location
- [ ] Identify if debugging tools (logs, network requests) are needed

#### 2. **SYSTEM STATE VERIFICATION** (2 minutes)
```bash
# Required validation queries - run these FIRST:
- Check authentication status: useAuthStatus()
- Verify database connection: test Supabase client
- Validate critical routes: /admin, /teacher, /kiosk paths
- Check component status: NotificationBell, QueueDisplay, UserManagement
```

#### 3. **DOCUMENTATION ALIGNMENT CHECK** (1 minute)  
- [ ] Compare claimed implementation status vs actual codebase
- [ ] Verify flowchart accuracy against current file structure
- [ ] Check if sprint documentation matches system reality

#### 4. **IMPLEMENTATION MODE SELECTION**
- **Discussion Mode**: User exploring options, planning, asking questions
- **Implementation Mode**: User using action words (implement, create, build, fix)
- **Debugging Mode**: System not working, errors reported, validation needed

---

## 🔍 REALITY CHECK PROTOCOL

### File System Validation
Before claiming any component exists or works:

```typescript
// REQUIRED CHECKS - Do these before ANY claims:
1. Does the file actually exist? (use lov-view)
2. Does it have the claimed functionality? (read the code)
3. Are the imports/dependencies correct? (check integration)
4. Is it actually being used? (search for usage across codebase)
```

### Database State Validation  
```sql
-- ALWAYS verify these before database claims:
SELECT COUNT(*) FROM auth.users;  -- Check user accounts exist
SELECT * FROM profiles WHERE role = 'admin'; -- Verify role assignments  
SELECT * FROM active_sessions LIMIT 5; -- Check session tracking
SELECT * FROM queue WHERE status = 'waiting'; -- Verify queue functionality
```

### Authentication System Checks
```javascript
// Validate auth system state before security claims:
- Is Google OAuth properly configured?
- Do users get assigned roles on signup?
- Are sessions being tracked correctly? 
- Do protected routes actually protect?
```

---

## 🚨 CRITICAL IMPLEMENTATION RULES

### 1. **NEVER CLAIM WITHOUT PROOF**
```markdown
❌ BAD: "I've implemented the AdminRoute component"
✅ GOOD: "I've created AdminRoute component at src/components/AdminRoute.tsx 
         and verified it works by testing with admin user navigation"
```

### 2. **VALIDATE BEFORE IMPLEMENTING**  
```markdown
❌ BAD: Start coding immediately when user asks for feature
✅ GOOD: Check if feature already exists, verify current state, then implement gaps
```

### 3. **TEST REALITY vs DOCUMENTATION**
```markdown  
❌ BAD: Trust sprint documentation as truth about system state
✅ GOOD: Verify documentation claims against actual codebase state
```

### 4. **USE DEBUGGING TOOLS FIRST**
```markdown
❌ BAD: Modify code when user reports issues without investigation  
✅ GOOD: Read console logs, check network requests, examine current state
```

---

## 🎯 SPRINT EXECUTION WORKFLOW

### Phase 1: VALIDATE (Always First)
1. **Run Reality Check Protocol** (verify current state vs documentation)
2. **Check Implementation Status** (what actually exists vs what's claimed)  
3. **Identify True Gaps** (what needs to be built vs what needs fixing)
4. **Plan Minimal Changes** (focus only on explicit user request)

### Phase 2: IMPLEMENT (Only After Validation)
1. **Create Missing Components** (build what doesn't exist)
2. **Fix Broken Components** (repair what exists but doesn't work)
3. **Update Integration Points** (ensure new components connect properly)  
4. **Test End-to-End** (verify complete user workflow)

### Phase 3: VALIDATE COMPLETION (Before Claiming Success)
1. **Test Actual Functionality** (does it work in practice?)
2. **Check Integration** (does it work with other components?)
3. **Verify User Requirements** (does it solve the stated problem?)
4. **Update Documentation** (reflect actual implementation state)

---

## 🔧 TOOL USAGE REQUIREMENTS

### Mandatory Tool Sequence
```markdown
1. ALWAYS check lov-read-console-logs when user reports issues
2. ALWAYS check lov-read-network-requests for API-related problems
3. ALWAYS use lov-view to verify files exist before claiming they work
4. ALWAYS use lov-search-files to find actual usage patterns
5. NEVER use lov-write without first reading the existing file
```

### Efficient Parallel Operations  
```markdown
✅ DO: Batch file reads when examining related components
✅ DO: Create multiple new files simultaneously when building features
✅ DO: Run validation queries in parallel when checking system state
❌ DON'T: Make sequential tool calls when parallel calls are possible
```

---

## ⚠️ COMMON PITFALLS TO AVOID

### Documentation Trusting Anti-Patterns
```markdown
❌ "The documentation says AdminRoute exists, so it must work"
✅ "Let me verify AdminRoute exists and functions correctly" (then check)

❌ "Phase 3 is complete according to the sprint docs"  
✅ "Let me validate Phase 3 completion by testing the claimed functionality"

❌ "The flowchart shows this component is implemented"
✅ "Let me check if this component actually exists and works as documented"
```

### Implementation Anti-Patterns
```markdown  
❌ Building features without checking if they already exist
✅ Searching codebase first to understand current state

❌ Fixing "broken" components without validating they're actually broken
✅ Testing components first to confirm issues before fixing

❌ Claiming completion without functional testing
✅ Validating end-to-end workflows before declaring success
```

### User Communication Anti-Patterns
```markdown
❌ "I've completed the authentication system" (without testing)
✅ "I've built the missing auth components and tested the login flow"

❌ "The system is ready for production" (based on documentation)  
✅ "I've validated core workflows and the system handles the key use cases"
```

---

## 📋 SUCCESS CRITERIA FRAMEWORK

### Definition of "Complete"
A sprint phase is ONLY complete when:
- [ ] **Functional Testing**: Real user workflows tested end-to-end
- [ ] **Component Integration**: All parts work together correctly  
- [ ] **Security Validation**: Authentication and authorization boundaries verified
- [ ] **Error Handling**: System gracefully handles edge cases
- [ ] **Documentation Accuracy**: Implementation status reflects actual system state

### Definition of "Working"
A component is ONLY working when:
- [ ] **Exists in Codebase**: File exists with claimed functionality
- [ ] **Integrates Properly**: Imports work, dependencies satisfied  
- [ ] **Functions Correctly**: Performs intended behavior without errors
- [ ] **Handles Edge Cases**: Graceful degradation and error states
- [ ] **Meets User Requirements**: Solves the stated problem

### Validation Requirements
Every implementation MUST include:
- [ ] **Direct Testing**: Actual usage of implemented functionality
- [ ] **Integration Testing**: Works with existing system components
- [ ] **Regression Testing**: Doesn't break existing functionality  
- [ ] **User Acceptance**: Meets stated requirements and success criteria

---

## 🎯 SPRINT HANDOFF PROTOCOL

### Preparing System for User Testing
Before claiming sprint completion:

1. **System State Documentation**
   - Update implementation status to reflect actual codebase
   - Document known issues and limitations honestly  
   - Provide clear testing instructions for user validation

2. **User Testing Preparation**
   - Identify specific user workflows to test
   - Document expected behavior vs edge cases
   - Provide rollback plan if critical issues discovered

3. **Quality Assurance Validation**
   - All claimed components exist and function
   - Security boundaries properly implemented and tested
   - No critical errors in console logs or user workflows

### Success Communication Framework
```markdown
✅ GOOD: "I've implemented [specific functionality] and tested [specific workflows]. 
         Ready for your validation of [specific user scenarios]."

❌ BAD: "Sprint complete, system ready for production."
```

---

**PROTOCOL PHILOSOPHY**: Trust but verify. Documentation is aspirational, code is truth. Always validate before implementing, always test before claiming completion.
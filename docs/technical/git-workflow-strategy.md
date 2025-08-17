# 🔄 Git Workflow Strategy - Production Sprint

## Workflow Overview
**Objective:** Maintain clear version control and enable safe rollbacks during 24-hour sprint execution.

---

## 🌳 Branch Strategy

### Branch Architecture
```
main
├── sprint/phase-1-auth-foundation
│   ├── sprint/phase-1-auth-foundation/super-admin-role
│   ├── sprint/phase-1-auth-foundation/google-oauth
│   ├── sprint/phase-1-auth-foundation/kiosk-liberation  
│   └── sprint/phase-1-auth-foundation/dev-login
├── sprint/phase-2-role-system
│   ├── sprint/phase-2-role-system/landing-logic
│   ├── sprint/phase-2-role-system/permissions-hook
│   └── sprint/phase-2-role-system/role-navigation
├── sprint/phase-3-mobile-ui
│   ├── sprint/phase-3-mobile-ui/component-library
│   ├── sprint/phase-3-mobile-ui/gesture-navigation
│   └── sprint/phase-3-mobile-ui/touch-optimization
├── sprint/phase-4-real-time
│   ├── sprint/phase-4-real-time/notification-bell
│   ├── sprint/phase-4-real-time/queue-subscriptions
│   └── sprint/phase-4-real-time/toast-integration
└── sprint/phase-5-polish
    ├── sprint/phase-5-polish/tutorial-system
    ├── sprint/phase-5-polish/cross-browser-testing
    └── sprint/phase-5-polish/security-audit
```

### Branch Naming Rules
- **Phase branches:** `sprint/phase-{n}-{domain-name}`
- **Feature branches:** `sprint/phase-{n}-{domain}/feature-name`
- **Hotfix branches:** `hotfix/phase-{n}-{issue-description}`

---

## 📝 Commit Standards

### Commit Message Format
```
<type>(phase-n): <description>

[optional body]

[optional footer]
```

### Commit Types
- **feat:** New feature implementation
- **fix:** Bug fixes and corrections
- **docs:** Documentation updates
- **test:** Testing implementations
- **refactor:** Code restructuring without functionality change
- **perf:** Performance improvements
- **style:** Code formatting and styling

### Example Commit Messages
```bash
feat(phase-1): implement super_admin role with database migration

- Add super_admin to role_type enum
- Update profiles table for Zach's account  
- Modify RLS policies to include super_admin
- Test role verification in get_current_user_role()

Closes: Phase 1 Task 1.1
```

```bash
fix(phase-3): resolve gesture detection on iOS Safari

- Add touch-action CSS property for iOS compatibility
- Update gesture threshold for better iPad responsiveness  
- Fix preventDefault() calls for scroll prevention

Testing: Verified on iPad Pro 11" and iPhone 12
```

---

## 🔄 Phase Workflow Protocol

### Phase Initiation
```bash
# Create new phase branch from main
git checkout main
git pull origin main
git checkout -b sprint/phase-{n}-{domain-name}

# Push phase branch
git push -u origin sprint/phase-{n}-{domain-name}
```

### Feature Development Within Phase
```bash
# Create feature branch from phase branch
git checkout sprint/phase-{n}-{domain}
git checkout -b sprint/phase-{n}-{domain}/feature-name

# Regular commits during development
git add .
git commit -m "feat(phase-n): implement specific feature component"

# Push feature progress
git push -u origin sprint/phase-{n}-{domain}/feature-name
```

### Phase Completion Protocol
```bash
# 1. Merge all completed features to phase branch
git checkout sprint/phase-{n}-{domain}
git merge sprint/phase-{n}-{domain}/feature-name

# 2. Update documentation
git add docs/
git commit -m "docs(phase-n): complete phase {n} documentation update"

# 3. Create phase completion tag
git tag -a "phase-{n}-complete" -m "Phase {n} completed: {domain-name}"
git push origin phase-{n}-complete

# 4. Prepare for next phase (after user approval)
git checkout main
git merge sprint/phase-{n}-{domain}
git push origin main
```

---

## 🚨 Emergency Rollback Procedures

### Feature-Level Rollback
```bash
# Revert specific commit within phase
git checkout sprint/phase-{n}-{domain}
git revert {commit-hash}
git commit -m "fix(phase-n): rollback {feature} due to {reason}"
git push origin sprint/phase-{n}-{domain}
```

### Phase-Level Rollback
```bash
# Return to previous phase state
git checkout sprint/phase-{n-1}-{domain}
git checkout -b rollback/phase-{n}-issues

# Cherry-pick working commits if needed  
git cherry-pick {working-commit-hash}

# Create emergency branch for fixes
git commit -m "fix(rollback): emergency rollback from phase {n}"
git push -u origin rollback/phase-{n}-issues
```

### Complete Sprint Rollback
```bash
# Nuclear option: return to pre-sprint state
git checkout main
git reset --hard {pre-sprint-commit-hash}

# Create backup branch of sprint work
git checkout sprint/phase-{current}-{domain}
git checkout -b backup/sprint-attempt-{timestamp}
git push -u origin backup/sprint-attempt-{timestamp}
```

---

## 📊 Progress Tracking

### Branch Status Monitoring
```bash
# Check phase completion status
git branch -a | grep sprint/phase

# View phase progress
git log --oneline --graph sprint/phase-{n}-{domain}

# Compare phase branches  
git diff sprint/phase-{n-1}-{domain}..sprint/phase-{n}-{domain}
```

### Documentation Sync Verification
```bash
# Ensure docs updated with code changes
git log --oneline docs/ | head -5

# Check for uncommitted documentation changes
git status docs/

# Verify doc updates in commit history
git log --grep="docs(phase-" --oneline
```

---

## 🔍 Quality Gates

### Pre-Commit Checks
- [ ] Code compiles without errors
- [ ] No console.error() statements in production code
- [ ] Documentation updated for new features
- [ ] Commit message follows format standards

### Pre-Phase-Completion Checks  
- [ ] All phase tasks completed and committed
- [ ] Documentation updated for entire phase
- [ ] Feature testing completed and documented
- [ ] No merge conflicts with main branch

### Pre-Sprint-Completion Checks
- [ ] All phase branches merged to main
- [ ] Complete documentation suite updated
- [ ] Security audit passes
- [ ] Performance benchmarks met

---

## 🎯 Success Metrics

### Git Workflow Health
- [ ] Clear commit history with descriptive messages
- [ ] No lost work due to merge conflicts
- [ ] Successful rollback capability maintained
- [ ] Phase-based progress clearly visible

### Documentation Sync
- [ ] Code changes match documentation updates
- [ ] Each phase completion includes doc updates
- [ ] Git history shows documentation evolution
- [ ] Rollback procedures documented and tested

---

*This Git workflow ensures safe, trackable progress during the intensive 24-hour sprint while maintaining rollback capabilities for risk mitigation.*
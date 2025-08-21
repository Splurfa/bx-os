# BX-OS Deployment Guide

## Pre-Deployment Checklist

### Requirements Validation
- [ ] **3 dedicated iPads** available for kiosk deployment
- [ ] **Stable WiFi network** with internet access across deployment area
- [ ] **Google Workspace admin access** for OAuth integration
- [ ] **Supabase project credentials** (provided by technical team)
- [ ] **Staff training schedule** arranged (2 hours minimum)

### Access Verification
- [ ] **Admin credentials** tested and working
- [ ] **Teacher accounts** created via Google OAuth
- [ ] **Student database** imported and validated (159 middle school students)
- [ ] **System connectivity** confirmed across all planned devices

## Step 1: iPad Kiosk Configuration (30 minutes)

### iPad Setup Process
1. **Connect iPads to WiFi network**
2. **Install browser** (Chrome or Safari recommended)
3. **Configure each iPad** with its designated URL:
   - **iPad 1**: Navigate to `[your-domain]/kiosk1`
   - **iPad 2**: Navigate to `[your-domain]/kiosk2` 
   - **iPad 3**: Navigate to `[your-domain]/kiosk3`
4. **Enable guided access mode** to prevent students from navigating away
5. **Test touch responsiveness** and screen orientation

### Guided Access Configuration
```
Settings > Accessibility > Guided Access
- Enable Guided Access
- Set Passcode for exit
- Configure Touch restrictions
- Disable hardware buttons
```

### Physical Placement
- **Position iPads** in quiet reflection areas
- **Ensure charging access** for continuous operation
- **Consider privacy screens** for student reflection
- **Label each station** clearly (Station 1, Station 2, Station 3)

## Step 2: Admin Dashboard Setup (15 minutes)

### Initial Admin Access
1. **Navigate to admin dashboard**: `[your-domain]/admin-dashboard`
2. **Login with Google OAuth** using administrative account
3. **Verify role assignment** shows "admin" or "super_admin"
4. **Test core functions**:
   - [ ] User management access
   - [ ] Queue monitoring displays
   - [ ] Kiosk status indicators
   - [ ] Notification settings

### User Management Configuration
1. **Access User Management** from admin dashboard
2. **Verify imported teacher accounts**
3. **Assign appropriate roles**:
   - **Teachers**: `teacher` role
   - **Additional admins**: `admin` role
   - **System administrators**: `super_admin` role
4. **Test role-based access** by logging in as different users

## Step 3: Teacher Onboarding (60 minutes)

### Teacher Account Setup
1. **Teachers navigate to**: `[your-domain]/teacher-dashboard`
2. **Login via Google OAuth** with school Google account
3. **Verify automatic role assignment** to "teacher"
4. **Test BSR creation workflow**:
   - [ ] Student search functionality
   - [ ] Behavior category selection
   - [ ] BSR submission process
   - [ ] Queue monitoring view

### Training Workflow
1. **Demonstrate BSR creation** (10 minutes)
   - Search for student by name or ID
   - Select appropriate behavior category
   - Add optional notes
   - Submit request

2. **Show queue monitoring** (10 minutes)
   - Real-time queue updates
   - Student assignment status
   - Completion notifications

3. **Practice session** (30 minutes)
   - Each teacher creates test BSR
   - Monitor queue progression
   - Verify notification system

4. **Q&A and troubleshooting** (10 minutes)

## Step 4: System Testing (45 minutes)

### End-to-End Workflow Validation
1. **Test BSR creation** → **student assignment** → **kiosk workflow** → **completion tracking**
2. **Verify real-time updates** across all dashboards
3. **Test concurrent access** with multiple teachers and admin oversight
4. **Validate notification system** (audio alerts, visual indicators)

### Error Scenario Testing
- **Network interruption recovery**
- **iPad restart procedure**
- **Student assignment conflicts**
- **Queue clearing functions**

### Performance Validation
- **Response times under 2 seconds** for normal operations
- **Real-time updates** propagate within 1 second
- **Concurrent user handling** (3 kiosks + multiple staff)

## Step 5: Go-Live Preparation (30 minutes)

### Final Configuration
- [ ] **Notification sounds** enabled on admin devices
- [ ] **iPad volume levels** appropriate for environment
- [ ] **Emergency contact procedures** established
- [ ] **Backup access methods** documented

### Staff Communication
- [ ] **Launch announcement** distributed to all staff
- [ ] **Quick reference guides** posted in staff areas
- [ ] **Technical support contacts** shared
- [ ] **Feedback collection method** established

## Troubleshooting Guide

### Common Issues & Solutions

**iPad Kiosk Not Loading**
- Check WiFi connection
- Clear browser cache
- Restart iPad
- Verify URL accuracy

**Student Not Appearing in Search**
- Confirm student is in middle school grades (6-8)
- Check spelling of name or ID
- Verify student database import
- Contact admin for database refresh

**Reflection Not Submitting**
- Check network connectivity
- Refresh page and retry
- Clear browser data
- Switch to different kiosk if persistent

**Queue Not Updating**
- Verify real-time connection status
- Refresh dashboard
- Check notification settings
- Contact technical support

### Emergency Procedures

**System-Wide Reset**
1. Admin dashboard → Queue Management
2. "Clear All Queues" button
3. Restart all iPad kiosks
4. Verify system restoration

**Technical Support Escalation**
- Document specific error messages
- Note affected devices/users
- Include timestamp of issue
- Contact technical team with details

## Success Criteria

### Day 1 Metrics
- [ ] All kiosks operational and accessible
- [ ] Teachers successfully creating BSRs
- [ ] Students completing reflection workflows
- [ ] Admin dashboard showing live activity

### Week 1 Validation
- [ ] 15-20 minute average completion time achieved
- [ ] Zero authentication issues for students
- [ ] Real-time updates functioning consistently
- [ ] Staff comfortable with all workflows

---

**Need Help?** Contact technical support with specific details about any issues encountered during deployment.
# Administrator User Guide

## Overview

As a BX-OS administrator, you have complete oversight of the system including user management, queue monitoring, and system configuration. This guide covers all administrative workflows and troubleshooting procedures.

## Getting Started

### Accessing Admin Dashboard
1. **Navigate to**: `[your-domain]/admin-dashboard`
2. **Login**: Use your Google account (must have admin/super_admin role)
3. **Verify access**: You should see the full admin interface with all management options

### Admin Dashboard Layout
- **Queue Monitor**: Real-time display of all active BSRs and student assignments
- **User Management**: Create, modify, and manage staff accounts
- **Kiosk Status**: Live status of all three kiosk stations
- **Notification Center**: System alerts and queue notifications
- **System Analytics**: Usage statistics and performance metrics

## Core Administrative Functions

### User Management

#### Adding New Staff Members
1. **Navigate to User Management** section
2. **Click "Add User"** or equivalent button
3. **Enter staff information**:
   - Email address (must be school Google account)
   - Role assignment (teacher, admin, super_admin)
   - Department/grade level (optional)
4. **Save and verify** - User will authenticate via Google OAuth on first login

#### Modifying User Roles
1. **Locate user** in User Management list
2. **Click edit/modify** button for the user
3. **Update role assignment**:
   - **teacher**: Can create BSRs and monitor own submissions
   - **admin**: Full system access except user role modification
   - **super_admin**: Complete system control including user management
4. **Save changes** - Role updates take effect immediately

#### Deactivating Users
1. **Find user** in management interface
2. **Select deactivate/disable** option
3. **Confirm action** - User will lose access immediately
4. **Note**: Deactivated users retain historical data but cannot login

### Queue Management & Monitoring

#### Real-Time Queue Oversight
- **Monitor active BSRs**: See all pending student assignments
- **Track kiosk utilization**: View which stations are occupied
- **Completion notifications**: Receive alerts when students finish reflections
- **Queue position tracking**: Understand student wait times

#### Queue Intervention Tools
1. **Emergency Queue Clear**:
   - Use "Clear All Queues" button for system-wide reset
   - Requires confirmation to prevent accidental activation
   - Moves all pending students back to unassigned status

2. **Individual BSR Management**:
   - Manually reassign students to specific kiosks
   - Cancel inappropriate or duplicate BSRs
   - Override queue positions for urgent cases

3. **Kiosk Control**:
   - Mark kiosks as "offline" for maintenance
   - Force-reset individual kiosk assignments
   - Monitor kiosk connectivity status

### System Monitoring

#### Performance Metrics
- **Daily usage statistics**: Number of BSRs created, students served
- **Average completion times**: Track efficiency improvements
- **Peak usage periods**: Identify high-traffic times
- **User activity logs**: Monitor staff engagement with system

#### Health Monitoring
- **Real-time connection status**: Verify all kiosks are online
- **Database connectivity**: Ensure system responsiveness
- **Authentication status**: Monitor Google OAuth integration
- **Notification system**: Test audio and visual alerts

## Advanced Administrative Tasks

### System Configuration

#### Notification Settings
1. **Access notification preferences** in admin panel
2. **Configure alert types**:
   - Audio alerts for new BSRs
   - Visual notifications for completions
   - Email summaries for daily activity
3. **Set notification timing**: Immediate vs. batched alerts
4. **Test notification system**: Use test buttons to verify functionality

#### Student Database Management
1. **Verify student records**: Ensure 159 middle school students loaded correctly
2. **Grade level filtering**: Confirm only 6th, 7th, 8th grade students appear
3. **Data validation**: Check for missing names, IDs, or grade information
4. **Import updates**: Process new student enrollments or changes

### Analytics & Reporting

#### Usage Analytics
- **BSR creation trends**: Track teacher usage patterns
- **Student completion rates**: Monitor reflection engagement
- **Peak times analysis**: Optimize kiosk availability
- **Behavior category reporting**: Identify common intervention needs

#### Administrative Reports
- **Daily summary reports**: BSR volume, completion rates, user activity
- **Weekly trend analysis**: Usage patterns and system performance
- **Monthly compliance reports**: Complete audit trails for administrative review
- **Custom date range reports**: Flexible reporting for specific periods

## Troubleshooting & Support

### Common Issues & Solutions

#### User Access Problems
**Teacher can't access dashboard:**
1. Verify Google account is school domain
2. Check role assignment in User Management
3. Confirm user hasn't been deactivated
4. Test Google OAuth integration

**Admin functions not visible:**
1. Verify admin/super_admin role assignment
2. Clear browser cache and retry
3. Check for system-wide authentication issues

#### Queue Management Issues
**Queue not updating in real-time:**
1. Check network connectivity
2. Refresh admin dashboard
3. Verify Supabase connection status
4. Contact technical support if persistent

**Students not appearing in queue:**
1. Confirm BSR was successfully created
2. Check student database for grade level
3. Verify middle school filtering is working
4. Manual queue refresh if needed

#### Kiosk Management Problems
**Kiosk shows offline:**
1. Check iPad network connection
2. Verify kiosk URL accuracy
3. Restart iPad if needed
4. Mark kiosk offline for maintenance if hardware issue

**Student assignment conflicts:**
1. Use "Clear All Queues" for system reset
2. Manually reassign students to specific kiosks
3. Monitor for duplicate assignments
4. Report persistent conflicts to technical team

### Emergency Procedures

#### System-Wide Issues
1. **Document the problem**: Screenshot errors, note affected users
2. **Attempt basic troubleshooting**: Clear queues, refresh connections
3. **Communicate with staff**: Notify teachers of system status
4. **Contact technical support**: Provide detailed issue description
5. **Implement fallback procedures**: Temporary paper-based process if needed

#### Data Recovery
- **Historical data**: All BSRs and completions are permanently stored
- **User accounts**: Can be recovered from Google OAuth integration
- **System configuration**: Admin settings are backed up automatically

## Best Practices

### Daily Operations
- **Morning system check**: Verify all kiosks online and responsive
- **Monitor queue flow**: Watch for unusual patterns or bottlenecks
- **Check notification alerts**: Ensure audio/visual systems working
- **Review completion rates**: Track student engagement with reflection process

### Weekly Reviews
- **Usage analytics**: Review weekly trends and patterns
- **Staff feedback**: Gather teacher input on system performance
- **System health**: Check for any recurring technical issues
- **Training needs**: Identify staff requiring additional support

### Monthly Maintenance
- **User account audit**: Review active accounts and role assignments
- **Performance analysis**: Assess system efficiency and improvements
- **Data cleanup**: Archive old records and maintain database performance
- **Documentation updates**: Keep procedures current with system changes

---

**Emergency Contact**: [Technical Support Information]  
**System Status**: Real-time status available in admin dashboard  
**Documentation**: Additional resources available in [Technical Reference](../TECHNICAL-REFERENCE/)
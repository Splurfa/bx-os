# Administrator Guide

Comprehensive guide for system administrators managing the Student Behavior Reflection System.

## Getting Started

### Administrator Access
1. **Login**: Use your administrator credentials at the system URL
2. **Navigation**: Access the Admin Dashboard from the main menu
3. **Overview**: The dashboard provides system-wide monitoring and control

### Dashboard Overview

The Admin Dashboard contains four main sections:
- **Kiosk Management**: Control and monitor reflection kiosks
- **Queue Display**: View and manage the active reflection queue
- **User Management**: Create, modify, and manage user accounts
- **Session Monitor**: Track active user sessions across the system

---

## Kiosk Management

### Understanding Kiosks

Kiosks are dedicated stations where students complete their behavior reflections. The system supports multiple kiosks for concurrent student use.

### Kiosk Controls

1. **Viewing Kiosk Status**
   - Each kiosk displays as a card showing its current state
   - **Active**: Green indicator, available for student assignment
   - **Inactive**: Gray indicator, not available for use
   - **Assigned**: Shows which student is currently using the kiosk

2. **Activating/Deactivating Individual Kiosks**
   - Use the toggle switch on each kiosk card
   - **Activated Time**: Displays when each kiosk was last activated
   - Changes take effect immediately across the system

3. **Bulk Kiosk Management**
   - **Deactivate All**: Quickly disable all kiosks using the red button
   - **Confirmation Required**: System will ask for confirmation before bulk actions
   - Use during maintenance, emergencies, or end-of-day shutdown

### Kiosk Assignment Logic

- Students are automatically assigned to available active kiosks
- Assignment follows a round-robin pattern to distribute load
- If no kiosks are active, students enter a waiting queue
- Kiosk assignment updates in real-time across all devices

### Best Practices
- Keep at least one kiosk active during school hours
- Deactivate kiosks during maintenance or cleaning
- Monitor kiosk utilization to determine optimal number of active stations
- Test kiosk functionality regularly

---

## Queue Management

### Understanding the Queue

The queue displays all active behavior support requests and their current status.

### Queue Information Display

Each queue item shows:
- **Student Name**: Full name of the student assigned to complete reflection
- **Teacher**: Last name of the submitting teacher (admin view only)
- **Status**: Current stage of the reflection process
- **Submission Time**: When the BSR was originally submitted
- **Assigned Kiosk**: Which kiosk the student should use (if active)

### Queue Actions

1. **Individual Item Removal**
   - Click the "Remove" button on specific queue items
   - **Confirmation Dialog**: System requires confirmation to prevent accidental removal
   - Use for incorrectly submitted requests or resolved situations

2. **Clear Entire Queue**
   - **Clear Queue Button**: Red button clears all items from the queue
   - **Double Confirmation**: System requires explicit confirmation
   - **Use Cases**: End of day cleanup, system reset, emergency situations

3. **Queue Monitoring**
   - Real-time updates show queue changes instantly
   - Monitor for bottlenecks or unusual patterns
   - Track completion rates and processing times

### Queue Status Types
- **Waiting**: BSR submitted, waiting for kiosk assignment
- **In Progress**: Student is completing reflection at assigned kiosk
- **Pending Review**: Reflection completed, awaiting teacher approval
- **Revision Requested**: Teacher requested additional reflection from student

---

## User Management

### Creating New Users

1. **Access User Creation**
   - Click "Add User" button in the User Management section
   - Form opens for new user information

2. **Required Information**
   - **First Name**: User's first name
   - **Last Name**: User's last name  
   - **Email**: Must be unique, used for login
   - **Role**: Select appropriate role level
   - **Password**: System generates secure temporary password

3. **User Roles**
   - **Student**: Can complete reflections assigned to them
   - **Teacher**: Can submit BSRs, review reflections, and manage their queue
   - **Admin**: Full system access including user management and kiosk control

4. **User Creation Process**
   - System validates email uniqueness
   - Creates authentication account
   - Establishes user profile in database
   - Sends credentials to designated email (if configured)

### Managing Existing Users

1. **User List Display**
   - View all system users with their roles and status
   - Search and filter capabilities for large user bases
   - Real-time status indicators

2. **Modifying User Roles**
   - **Role Changes**: Update user permissions as needed
   - **Immediate Effect**: Role changes apply instantly
   - **Security**: Only admins can modify user roles

3. **User Removal**
   - **Delete Users**: Remove users who no longer need access
   - **Confirmation Required**: System prevents accidental deletions
   - **Data Retention**: Historical data remains for reporting purposes

### User Management Best Practices
- Regularly audit user lists for inactive accounts
- Use appropriate roles to maintain system security
- Update roles promptly when staff responsibilities change
- Maintain updated contact information for password resets

---

## Session Monitoring

### Understanding Active Sessions

The Session Monitor tracks all users currently logged into the system across all devices.

### Session Information
- **User Name**: Full name of logged-in user
- **Role**: User's current permission level
- **Device Type**: Desktop, tablet, mobile, or kiosk
- **Login Time**: When the session began
- **Last Activity**: Most recent system interaction
- **Status**: Active, idle, or disconnected

### Session Management
- **Real-Time Updates**: Session list refreshes automatically
- **Idle Detection**: System identifies inactive sessions
- **Security Monitoring**: Track unusual login patterns or concurrent sessions
- **Performance Insights**: Monitor system load and usage patterns

### Administrative Actions
- Monitor for unauthorized access attempts
- Identify users who may need technical support
- Track system usage for capacity planning
- Verify proper session termination

---

## System Administration

### Daily Operations Checklist

**Morning Startup:**
- [ ] Verify kiosks are activated as needed for the day
- [ ] Check overnight queue accumulation
- [ ] Review active user sessions for any issues
- [ ] Confirm system connectivity and performance

**During School Hours:**
- [ ] Monitor queue flow and processing times
- [ ] Respond to teacher requests for queue clearing
- [ ] Address any kiosk technical issues promptly
- [ ] Track unusual system usage patterns

**End of Day:**
- [ ] Clear remaining queue items as appropriate
- [ ] Deactivate kiosks if desired
- [ ] Review daily usage statistics
- [ ] Check for any pending administrative tasks

### Troubleshooting Common Issues

**Kiosk Not Responding:**
1. Deactivate the problematic kiosk
2. Wait 30 seconds, then reactivate
3. Test with a sample reflection
4. If issues persist, check device connectivity

**Queue Not Clearing:**
1. Refresh the admin dashboard page
2. Verify user permissions
3. Try individual item removal first
4. Contact technical support if persistent

**Student Cannot Access Reflection:**
1. Verify kiosk is active and properly assigned
2. Check student's password requirements
3. Ensure BSR was properly submitted by teacher
4. Review system logs for error messages

**Real-Time Updates Not Working:**
1. Check internet connectivity
2. Refresh browser or restart application
3. Verify browser compatibility and settings
4. Check system status for service interruptions

### System Maintenance

**Regular Tasks:**
- Review user access lists monthly
- Update user roles as staff changes occur
- Monitor system performance and capacity
- Backup configuration settings and user data

**Periodic Reviews:**
- Assess kiosk deployment effectiveness
- Analyze usage patterns for optimization
- Review security logs for unusual activity
- Evaluate need for additional administrative features

### Emergency Procedures

**System Outage:**
1. Check internet connectivity and power
2. Verify system status at hosting provider
3. Contact technical support immediately
4. Implement backup paper processes if needed
5. Communicate status to staff

**Security Incident:**
1. Document the incident immediately
2. Change administrative passwords if compromised
3. Review user access logs
4. Contact system support and school leadership
5. Follow school's cybersecurity protocols

**Data Concerns:**
1. Do not attempt data recovery without technical support
2. Preserve system state for analysis
3. Contact hosting provider and technical support
4. Follow school data protection policies
5. Communicate with affected users as appropriate

---

## Best Practices & Tips

### Deployment Strategy
- Start with a small pilot group of teachers and students
- Gradually expand usage across the school
- Provide adequate training before full implementation
- Establish clear policies and procedures
- Monitor system adoption and user feedback

### User Training
- Schedule role-specific training sessions
- Create quick reference guides for common tasks
- Establish peer mentoring programs
- Provide ongoing support during initial weeks
- Document frequently asked questions and solutions

### System Optimization
- Monitor peak usage times and adjust kiosk availability
- Track completion rates and identify improvement opportunities
- Regularly review and update user roles and permissions
- Analyze queue patterns to optimize workflow
- Gather feedback from teachers and students for enhancements

### Security Management
- Regularly review and update user access
- Monitor for unusual login patterns or system usage
- Keep administrative credentials secure and updated
- Follow school policies for data privacy and protection
- Maintain system backups and recovery procedures

---

## Support & Resources

### Getting Help
- **Technical Issues**: Contact your system provider's support team
- **Training Needs**: Schedule additional sessions with school technology coordinator
- **Policy Questions**: Refer to school behavior management policies
- **User Problems**: Use this guide and the User Guide for troubleshooting

### System Monitoring
- Regular system health checks are recommended
- Monitor user feedback for potential improvements
- Track usage statistics for capacity planning
- Stay informed about system updates and new features

### Documentation Updates
- This guide is updated periodically with new features and improvements
- Check for updated versions regularly
- Provide feedback on guide clarity and completeness
- Suggest additional topics or clarifications needed

---

*Administrator Guide - Student Behavior Reflection System*
*Empowering administrators to create positive learning environments through effective behavior management.*
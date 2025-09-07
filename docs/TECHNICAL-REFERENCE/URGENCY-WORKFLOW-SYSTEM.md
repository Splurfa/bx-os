# Urgency-Based Workflow System

## Overview

The BX-OS urgency-based workflow system provides differentiated processing and notification routing based on the severity and context of behavior support requests. This system ensures that critical incidents receive immediate attention while maintaining efficient processing for standard cases.

## Urgency Levels

### 1. Standard (Default)
- **Description**: Regular behavior incidents requiring standard processing
- **Processing**: Normal queue order (FIFO within priority group)
- **Notifications**: In-app notifications only
- **Visual**: Default background, no special badges
- **Use Cases**: Most classroom behavior incidents, routine redirection needs

### 2. Re-Integration
- **Description**: Students returning from suspension or requiring priority re-entry support
- **Processing**: Higher queue priority than standard, expedited assignment
- **Notifications**: In-app + Slack channel notifications
- **Visual**: Very light yellow gradient background, "Re-Integration" badge
- **Use Cases**: Post-suspension returns, behavior plan check-ins, follow-up sessions

### 3. Urgent
- **Description**: Critical incidents requiring immediate intervention
- **Processing**: Highest queue priority, immediate assignment when kiosk available
- **Notifications**: In-app + Slack + Email to all admins
- **Visual**: Very light red gradient background, "Urgent" badge with alert icon
- **Use Cases**: Safety concerns, escalating behavior, emergency de-escalation needs

## Technical Implementation

### Database Schema

The urgency system leverages existing database fields with enhanced logic:

```sql
-- behavior_requests table utilizes:
urgency_level TEXT DEFAULT 'standard' -- 'standard', 're_integration', 'urgent'
priority_level TEXT -- 'medium', 'high' (mapped from urgency)
```

### Queue Prioritization Algorithm

Items are sorted by:
1. **Review Status**: Items requiring teacher review (highest priority)
2. **Urgency Level**: urgent > re_integration > standard
3. **Creation Time**: Oldest first within same urgency level

### Visual Design System

Implemented through design tokens in `index.css`:

```css
/* Urgency Level Gradients - Very light backgrounds */
--urgency-standard: 0 0% 98%;        /* Nearly white */
--urgency-reintegration: 48 100% 96%; /* Very light yellow */
--urgency-urgent: 0 100% 97%;         /* Very light red */
```

## Notification Routing

### In-App Notifications
- **All Levels**: Real-time browser notifications with urgency-specific audio
- **Standard**: Single notification sound, standard volume
- **Re-Integration**: Single notification sound, increased volume
- **Urgent**: Double notification sound, full volume, persistent notification

### External Notifications

#### Slack Integration
- **Re-Integration & Urgent**: Automatic Slack webhook notifications
- **Channels**: 
  - `#urgent-bsr` - Critical incidents requiring immediate response
  - `#reintegration-bsr` - Priority re-entry support needs
- **Format**: Structured messages with student info, teacher, behaviors, timestamp

#### Email Notifications
- **Urgent Only**: Automatic email alerts to all admin users
- **Recipients**: Users with 'admin' or 'super_admin' roles
- **Content**: Detailed incident information with dashboard link

## Workflow Implementation

### Teacher Submission Process

1. **Create BSR Form**: Enhanced urgency selection dialog
2. **Urgency Decision**: Three-option radio selection with clear descriptions
3. **Submission**: Automatic routing based on selected urgency level
4. **Confirmation**: Toast notification confirming submission and expected processing

### Queue Processing

1. **Automatic Sorting**: Queue items ordered by urgency-based algorithm
2. **Visual Indicators**: Gradient backgrounds and urgency badges for clear identification
3. **Kiosk Assignment**: Urgent items get priority assignment to available kiosks
4. **Real-time Updates**: Live queue refreshing with urgency-aware subscriptions

### Admin Monitoring

1. **Dashboard View**: Clear urgency indicators across all queue displays
2. **Notification Management**: Granular control over notification preferences
3. **Historical Tracking**: Urgency-based filtering and reporting capabilities
4. **Override Capabilities**: Admin ability to modify urgency levels if needed

## Configuration

### Environment Variables Required

```bash
# Slack Webhook URLs
SLACK_URGENT_WEBHOOK_URL=https://hooks.slack.com/services/...
SLACK_REINTEGRATION_WEBHOOK_URL=https://hooks.slack.com/services/...

# Email Service (Resend)
RESEND_API_KEY=re_...
```

### Notification Settings Database

Users can configure notification preferences through the `notification_settings` table:

- `audio_enabled`: In-app sound notifications
- `push_enabled`: Browser push notifications  
- `reflection_ready`: Reflection completion alerts
- `urgency_urgent`: Urgent incident notifications
- `urgency_reintegration`: Re-integration notifications

## Edge Functions

### send-urgency-notifications

**Purpose**: Routes urgency-specific notifications to external systems

**Triggers**: 
- Automatically called when BSR is created with 're_integration' or 'urgent' urgency
- Invoked by `useSupabaseQueue.addToQueue()` after successful database insertion

**Processing**:
1. Determines notification recipients based on urgency level
2. Formats messages for different channels (Slack, email)
3. Dispatches notifications to configured endpoints
4. Logs delivery status for monitoring

**Error Handling**: 
- Graceful degradation if external services are unavailable
- Detailed logging for troubleshooting notification failures
- Does not block BSR creation if notifications fail

## Performance Considerations

### Queue Loading Optimization
- Urgency-based sorting implemented in database query
- Minimal client-side processing for large queues
- Real-time subscriptions filtered by relevance

### Notification Rate Limiting
- Slack webhook rate limits respected
- Email notifications batched for multiple urgent incidents
- In-app notifications deduplicated within time windows

### Visual Performance
- CSS-based gradients for optimal rendering
- Semantic design tokens prevent style recalculation
- Minimal DOM updates for urgency indicator changes

## Security & Access Control

### Authorization
- Only authenticated teachers can create BSRs with any urgency level
- Admins can view all urgency levels in queue
- Students (kiosk users) cannot see urgency information

### Data Privacy
- Urgency level included in behavior history for audit purposes
- External notifications contain minimal student information
- Notification preferences stored per-user for privacy compliance

### Rate Limiting
- Kiosk authentication rate limiting prevents abuse
- Notification frequency controls prevent spam
- Queue clearing actions logged with urgency context

## Monitoring & Analytics

### Key Metrics
- BSR creation count by urgency level
- Average processing time by urgency
- Notification delivery success rates
- Queue position changes due to urgency

### Troubleshooting
- Edge function logs for notification debugging
- Real-time subscription monitoring
- Queue state validation and consistency checks

## Future Enhancements

### Planned Features
- **Smart Urgency Detection**: AI-powered urgency level suggestions based on behavior patterns
- **Escalation Workflows**: Automatic urgency level increases based on time thresholds
- **Integration Expansion**: Additional notification channels (Teams, Discord, SMS)
- **Predictive Analytics**: Urgency trend analysis and proactive intervention recommendations

### Scalability Considerations
- **Multi-School Support**: Urgency configuration per school/district
- **Custom Urgency Levels**: User-defined urgency categories beyond standard three-tier
- **Advanced Routing**: Complex notification routing based on user schedules and availability
- **Performance Optimization**: Urgency-based queue caching and materialized views

## Related Documentation

- [Notification System](./NOTIFICATION-SYSTEM.md) - Core notification infrastructure
- [Queue Management](../flowcharts/Current-State/07-current-queue-management.md) - Queue processing workflows  
- [Teacher Guide](../USER-GUIDES/TEACHER-GUIDE.md) - User-facing urgency selection guidance
- [Admin Guide](../USER-GUIDES/ADMIN-GUIDE.md) - Administrative urgency management
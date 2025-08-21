# 🚀 Sprint 02 Deployment Guide - BX-OS iPad Setup

## ✅ SYSTEM READY FOR DEPLOYMENT

### iPad Kiosk URLs (Static)
- **iPad 1**: `https://yoursite.lovable.app/kiosk1`
- **iPad 2**: `https://yoursite.lovable.app/kiosk2`  
- **iPad 3**: `https://yoursite.lovable.app/kiosk3`

## 📋 Tech Team Setup Instructions

### Step 1: Admin Dashboard Access
1. Navigate to: `https://yoursite.lovable.app/admin-dashboard`
2. Login with admin credentials
3. Go to "System Overview" tab
4. Activate all 3 kiosks using the toggle switches

### Step 2: iPad Configuration
For each iPad:
1. Open Safari browser
2. Navigate to the assigned kiosk URL
3. Add to Home Screen (for full-screen app experience)
4. Test student workflow:
   - Select student from search
   - Complete reflection questions
   - Verify submission

### Step 3: Network Requirements
- **Internet Connection**: Required for real-time updates
- **No Authentication**: Students access kiosks anonymously
- **Admin Access**: Separate URLs require authentication

### Step 4: Notification System Setup
- **Staff PWA Installation**: Install BX-OS as PWA for enhanced notifications
- **Push Notification Permissions**: Guide staff through browser notification setup
- **Audio Notification Settings**: Configure in-app audio notifications
- **User Notification Guide**: Reference `Docs/USER-NOTIFICATION-GUIDE.md` for complete setup

## 🎯 System Capabilities

### Student Access (Anonymous)
- 159 middle school students (6th, 7th, 8th grade) available for selection
- No login required for students
- Reflection workflow completed on iPads
- Real-time queue updates

### Teacher Access (Authenticated)
- Create BSRs (Behavioral Support Requests)
- Monitor student queue
- Review reflections
- Clear individual students from queue

### Admin Access (Authenticated)
- Activate/deactivate kiosks
- Clear all queues
- User management
- System monitoring

## 🔧 Troubleshooting

### iPad Issues
- **Kiosk not loading**: Check admin dashboard - ensure kiosk is activated
- **Students not appearing**: Refresh page - only middle school students display
- **Reflection not submitting**: Check internet connection

### Queue Issues
- **Students stuck in queue**: Admin can clear individual students or entire queue
- **Real-time updates not working**: Refresh browser page

### Emergency Procedures
- **Reset all queues**: Admin dashboard → "Clear Queue" button
- **Deactivate all kiosks**: Admin dashboard → "Deactivate All" button

## 📊 Expected Load
- **159 students** maximum in selection pool
- **3 concurrent kiosk users** maximum
- **Real-time updates** across all sessions
- **Reliable queue management** with admin oversight

---

**System Status**: ✅ Production Ready (pending pre-deployment bug fixes)
**Deployment Method**: Static URLs (no session management complexity)
**Security**: Anonymous kiosk access, authenticated admin/teacher access
**Notifications**: Bell dropdown, audio/push notifications operational with user controls
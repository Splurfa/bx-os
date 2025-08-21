# Kiosk Setup Guide

## Overview

This guide covers the technical setup and configuration of the three iPad kiosks that serve as student reflection stations. Each kiosk provides anonymous access for students to complete guided behavioral reflections.

## Hardware Requirements

### iPad Specifications
- **iPad generation**: 6th generation or newer recommended
- **Storage**: 32GB minimum, 64GB recommended
- **Network**: WiFi-enabled with stable internet connection
- **Screen size**: 10.2" or larger for optimal user experience
- **Condition**: Good working order with responsive touch screen

### Physical Setup Requirements
- **Charging access**: Each kiosk location needs power outlet
- **Network coverage**: Strong WiFi signal in all kiosk areas
- **Privacy consideration**: Quiet areas suitable for reflection
- **Accessibility**: Locations accessible to all students
- **Security**: Areas with appropriate supervision but student privacy

## iPad Configuration

### Initial Setup Process

#### 1. Basic iPad Configuration
1. **Connect to school WiFi** network
2. **Update iOS** to latest compatible version
3. **Install browser** (Safari pre-installed, Chrome optional)
4. **Test touch responsiveness** across entire screen
5. **Configure display settings**:
   - Auto-brightness: OFF
   - Screen timeout: Never (while plugged in)
   - Orientation lock: Portrait

#### 2. Network and Browser Setup
1. **Open Safari browser**
2. **Test internet connectivity** with basic web browsing
3. **Clear any existing browsing data**
4. **Configure browser settings**:
   - Private browsing: OFF (not needed for anonymous access)
   - Block cookies: OFF (required for application function)
   - JavaScript: ON (required for application)

#### 3. Kiosk URL Assignment
Configure each iPad with its designated URL:

**iPad 1 (Kiosk Station 1)**
- Navigate to: `[your-domain]/kiosk1`
- Bookmark URL for quick access
- Test page loads correctly

**iPad 2 (Kiosk Station 2)**
- Navigate to: `[your-domain]/kiosk2`
- Bookmark URL for quick access
- Test page loads correctly

**iPad 3 (Kiosk Station 3)**
- Navigate to: `[your-domain]/kiosk3`
- Bookmark URL for quick access
- Test page loads correctly

### Guided Access Configuration

Guided Access prevents students from navigating away from the reflection application.

#### Setting Up Guided Access
1. **Navigate to Settings** → **Accessibility** → **Guided Access**
2. **Enable Guided Access**: Toggle ON
3. **Set Passcode**: Create 4-digit code for staff to exit Guided Access
4. **Configure options**:
   - Time Limits: OFF
   - Touch: Configure areas to disable if needed
   - Hardware Buttons: Disable Sleep/Wake button
   - Motion: Allow (for proper app function)

#### Activating Guided Access for Kiosk Use
1. **Open kiosk URL** in Safari
2. **Triple-click home button** (or side button on newer iPads)
3. **Configure restrictions**:
   - Disable address bar access
   - Disable navigation buttons
   - Allow screen area where reflection interface appears
4. **Tap "Start"** to begin Guided Access session
5. **Test restrictions** - ensure students can't exit application

### Application Testing

#### Functionality Testing
1. **Load kiosk page** and verify complete loading
2. **Test touch interactions** on all buttons and inputs
3. **Complete sample reflection** workflow:
   - Mood slider interaction
   - Text input functionality
   - Submit button response
   - Completion confirmation
4. **Verify assignment system** - check that kiosk shows "waiting for assignment" when no student assigned

#### Network Resilience Testing
1. **Temporarily disconnect WiFi** and observe behavior
2. **Reconnect network** and test automatic recovery
3. **Test slow network conditions** to ensure reasonable performance
4. **Verify real-time updates** when BSRs are created

## Physical Installation

### Kiosk Placement Strategy

#### Location Requirements
- **Privacy**: Quiet areas where students can reflect without distraction
- **Supervision**: Visible to staff but allowing student privacy
- **Accessibility**: Easy to find and reach from classrooms
- **Network**: Strong WiFi signal strength
- **Power**: Access to electrical outlets for continuous charging

#### Recommended Locations
- **Library quiet areas**: Away from high-traffic zones
- **Counseling office vicinity**: Near support staff but not directly supervised
- **Administrative hallways**: Accessible but separate from main student flow
- **Study rooms**: Individual spaces if available

### Physical Setup

#### Mounting and Security
1. **iPad stands**: Use stable, adjustable stands for proper viewing angle
2. **Cable management**: Secure charging cables to prevent tangling
3. **Signage**: Clear labels identifying each station (Station 1, 2, 3)
4. **Security considerations**: Consider cable locks if theft is a concern

#### Charging Setup
- **Use official iPad chargers** for optimal charging speed
- **Cable length**: Ensure sufficient reach from outlet to iPad position
- **Power management**: Consider outlet timers if needed for power management
- **Backup charging**: Keep spare chargers available for quick replacement

## Maintenance Procedures

### Daily Checks
- [ ] **Visual inspection**: Check for physical damage or issues
- [ ] **Power status**: Verify all iPads are charging properly
- [ ] **Network connectivity**: Confirm all kiosks can access application
- [ ] **Application status**: Check that kiosk pages load correctly
- [ ] **Guided Access**: Verify restriction mode is active

### Weekly Maintenance
- [ ] **Screen cleaning**: Clean touch screens with appropriate cleaning materials
- [ ] **Software updates**: Check for and install iOS updates during low-usage periods
- [ ] **Cable inspection**: Check charging cables for wear or damage
- [ ] **Performance testing**: Complete full reflection workflow on each kiosk
- [ ] **Admin reporting**: Report any issues or concerns to BX-OS administrator

### Monthly Reviews
- [ ] **Usage analytics**: Review kiosk utilization from admin dashboard
- [ ] **Performance assessment**: Evaluate response times and user experience
- [ ] **Hardware evaluation**: Check for signs of wear requiring replacement
- [ ] **Configuration verification**: Ensure all settings remain properly configured

## Troubleshooting

### Common Issues & Solutions

#### Kiosk Page Won't Load
**Possible causes and solutions:**
1. **Network connectivity**: Check WiFi connection, restart router if needed
2. **Browser cache**: Clear Safari cache and reload page
3. **iOS updates**: Install pending system updates
4. **Application issues**: Contact BX-OS administrator for server status

#### Touch Screen Not Responding
**Troubleshooting steps:**
1. **Screen cleaning**: Clean screen with appropriate materials
2. **Restart iPad**: Full power cycle may resolve touch issues
3. **Guided Access conflicts**: Exit and restart Guided Access
4. **Hardware failure**: Contact technical support for hardware replacement

#### Student Can Exit Application
**Security fixes:**
1. **Guided Access disabled**: Re-enable and configure properly
2. **Passcode compromised**: Change Guided Access passcode
3. **Configuration errors**: Review and reconfigure touch restrictions
4. **iOS updates**: Check if system updates affected Guided Access settings

#### Slow Performance
**Performance optimization:**
1. **Close background apps**: Double-tap home button and close unused apps
2. **Restart iPad**: Regular restarts improve performance
3. **Storage space**: Ensure adequate free storage space
4. **Network speed**: Test and improve WiFi signal strength

### Emergency Procedures

#### Complete Kiosk Failure
1. **Document issue**: Note error messages, symptoms, and timing
2. **Attempt basic troubleshooting**: Restart, network check, cache clear
3. **Contact administrator**: Report issue with details for technical support
4. **Implement workaround**: Redirect students to available kiosks temporarily
5. **Manual tracking**: Use paper backup for BSR tracking if needed

#### Network Outage
1. **Verify outage scope**: Check if issue affects single kiosk or entire system
2. **Contact network support**: Report connectivity issues to IT department
3. **Monitor recovery**: Test kiosk functionality as network returns
4. **Resume operations**: Verify all functions working before returning to normal use

## Quality Assurance

### Setup Validation Checklist
- [ ] All three kiosks loading designated URLs correctly
- [ ] Guided Access properly configured and active
- [ ] Touch interactions working across all interface elements
- [ ] Network connectivity stable and reliable
- [ ] Charging systems functional and secure
- [ ] Physical placement appropriate for student privacy and supervision
- [ ] Staff trained on basic troubleshooting and maintenance

### Performance Standards
- **Page load time**: Under 3 seconds for initial kiosk page load
- **Touch responsiveness**: Immediate response to touch interactions
- **Network reliability**: 99%+ uptime during school hours
- **Battery life**: Continuous operation while plugged in
- **User experience**: Students can complete reflection without technical assistance

---

**Technical Support**: Contact BX-OS administrator for technical issues  
**Hardware Problems**: Report to school IT department or device support  
**Emergency Contact**: [Administrative contact information]
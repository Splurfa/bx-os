# Troubleshooting Guide

Common issues and solutions for the Student Behavior Reflection System.

## 🚨 Critical Issues

### Clear Queue Functionality Broken
**Status**: 🔴 UNRESOLVED - Blocks deployment

**Symptoms**:
- "Clear Queue" button shows success message
- Records remain in `behavior_requests` table
- No error messages in console

**Impact**: Prevents proper queue management in production

**See**: [Critical Issues](./CRITICAL_ISSUES.md) for detailed analysis

## 🔧 Development Issues

### Build & Setup Problems

#### Node Modules Issues
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

#### Vite Dev Server Issues
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Database Connection Issues

#### Supabase Connection Failed
1. **Check environment variables**:
   ```bash
   echo $VITE_SUPABASE_URL
   echo $VITE_SUPABASE_ANON_KEY
   ```

2. **Verify Supabase status**: Check https://status.supabase.com

3. **Test connection manually**:
   ```javascript
   import { supabase } from './src/integrations/supabase/client'
   const { data, error } = await supabase.from('profiles').select('*').limit(1)
   console.log({ data, error })
   ```

#### RLS Policy Errors
- Check user authentication status
- Verify user has correct role
- Review policy conditions in Supabase dashboard

### Authentication Issues

#### Login Fails
1. **Check demo credentials**:
   - Teacher: `teacher@school.edu` / `teacher123`
   - Admin: `admin@school.edu` / `admin123`

2. **Clear browser storage**:
   ```javascript
   localStorage.clear()
   sessionStorage.clear()
   ```

3. **Check network requests** in DevTools for auth errors

#### Role-based Access Problems
- Verify user profile exists in `profiles` table
- Check `role` field matches expected values
- Ensure RLS policies allow role-based access

### Real-time Updates Not Working

#### Subscription Issues
1. **Check connection status**:
   ```javascript
   supabase.channel('test').subscribe((status) => {
     console.log('Realtime status:', status)
   })
   ```

2. **Verify table permissions** for real-time in Supabase

3. **Check browser network** for WebSocket connections

### PWA Issues

#### Service Worker Registration Fails
**Status**: ⚠️ Non-blocking for core functionality

**Symptoms**:
- Console error: `SecurityError: Failed to register service worker`
- PWA install prompt doesn't appear

**Workaround**: Core app functions normally without PWA features

## 🐛 Common User Issues

### Kiosk Interface Problems

#### Student Can't Submit Reflection
1. **Check behavior selection** - must be selected
2. **Verify text input** - reflection text required
3. **Test network connection** - submit requires internet

#### Kiosk Doesn't Update Status
- Check real-time subscription connection
- Verify kiosk is properly activated
- Test with browser refresh

### Dashboard Issues

#### Queue Not Loading
1. **Check user authentication**
2. **Verify teacher/admin role**
3. **Test database connection**
4. **Check console for errors**

#### Real-time Updates Missing
- Verify subscription is active
- Check network connection
- Test with manual refresh

## 🔍 Debugging Steps

### 1. Check Console Logs
```javascript
// Enable verbose logging
localStorage.setItem('supabase.auth.debug', true)
```

### 2. Monitor Network Requests
- Open DevTools → Network tab
- Look for failed API calls
- Check response status codes

### 3. Test Database Directly
```javascript
// Test basic connection
const { data, error } = await supabase
  .from('behavior_requests')
  .select('*')
  .limit(5)
console.log({ data, error })
```

### 4. Check Authentication State
```javascript
// Current user info
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
```

## 📞 Getting Help

### Documentation Resources
- [Known Issues](./KNOWN_ISSUES.md) - Current system issues
- [Critical Issues](./CRITICAL_ISSUES.md) - Urgent problems
- [API Documentation](../technical/API.md) - Database operations
- [Frontend Architecture](../technical/FRONTEND.md) - Component structure

### Development Support
- Check browser console for errors
- Use Supabase dashboard for database debugging
- Test with demo accounts for consistent results
- Review recent changes in git history

### Escalation Path
1. Check this troubleshooting guide
2. Review relevant documentation
3. Search existing issues
4. Create detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors
   - Environment details
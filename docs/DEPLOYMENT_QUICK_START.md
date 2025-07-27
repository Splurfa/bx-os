# Quick Deployment Guide

## Netlify Deployment (Recommended)

### 1. Connect GitHub Repository
1. **Connect GitHub** in Lovable (if not already connected)
2. Go to [Netlify](https://netlify.com) and sign up/login
3. Click **"Import from Git"** → **"GitHub"**
4. Select your project repository

### 2. Configure Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: (leave empty)

### 3. Add Environment Variables
In Netlify dashboard → Site settings → Environment variables:
```
VITE_SUPABASE_URL=https://tuxvwpgwnnozubdpskhr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1eHZ3cGd3bm5venViZHBza2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0ODk3NjgsImV4cCI6MjA2OTA2NTc2OH0.zukCQDiwyIfRKujGWwzLUkIsgv3RM3b8WtjdNWjHqnw
```

### 4. Configure SPA Routing
Create `public/_redirects` file with:
```
/*    /index.html   200
```

### 5. Deploy
1. Click **"Deploy site"**
2. Wait for build to complete (2-3 minutes)
3. Access your live application ✅

## Alternative Deployment Options

### Via Lovable Platform
1. Click **"Publish"** in Lovable editor
2. Choose subdomain: `your-app.lovable.app`
3. Deploy (2-3 minutes)
4. Access your live application ✅

### Via GitHub + Vercel
1. **Import to Vercel**: Connect your repository
2. **Build Settings**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Add same environment variables as above**
4. **Deploy** - Done! ✅

## Database Status
- ✅ **Supabase**: Fully configured and ready
- ✅ **Tables**: All tables and relationships created
- ✅ **Security**: RLS policies active
- ✅ **Functions**: Database functions deployed
- ✅ **Sample Data**: Demo users and students available

## Demo Accounts
```
Teacher: teacher@school.edu / teacher123
Admin: admin@school.edu / admin123
```

## Environment
- **Supabase URL**: `https://tuxvwpgwnnozubdpskhr.supabase.co`
- **Frontend**: React + TypeScript + Tailwind
- **Real-time**: WebSocket subscriptions active
- **Authentication**: JWT-based with role management

## Netlify-Specific Verification
- [ ] Application loads successfully
- [ ] All routes work (no 404 errors on direct URL access)
- [ ] Login works with demo accounts
- [ ] Teacher dashboard shows queue
- [ ] Admin dashboard accessible
- [ ] Real-time updates working
- [ ] Kiosk interface functional

## Important Notes
- **SPA Routing**: The `_redirects` file is crucial for React Router to work properly
- **Environment Variables**: Must be set in Netlify dashboard for Supabase connection
- **Auto-Deploy**: Netlify will automatically redeploy when you push to GitHub

## Support
All systems are production-ready. For custom domains or advanced configuration, see the full deployment guide.
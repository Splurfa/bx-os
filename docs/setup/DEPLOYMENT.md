# Deployment Guide

Two easy ways to deploy. No environment variables needed (Supabase client is preconfigured).

Option A: Lovable Publish
1. Click "Publish" in the Lovable editor
2. Choose a subdomain (e.g., your-app.lovable.app)
3. Deploy and share the link

Option B: Netlify or Vercel
1. Connect your GitHub repository
2. Build command: npm run build
3. Output/Publish directory: dist
4. SPA routing: ensure public/_redirects contains `/*    /index.html   200`
5. Deploy

Post-deploy checklist
- All routes work (no 404 on refresh)
- Login works; Admin Dashboard accessible
- Queue updates in real time
- Kiosk toggles operate and “Activated” time shows
- PWA install prompt appears (HTTPS)

Notes
- App is a React + TypeScript + Tailwind SPA built with Vite
- Supabase URL and anon key are embedded in the client for this build
- For production hardening, rotate keys and move to server-side secrets via Edge Functions where needed

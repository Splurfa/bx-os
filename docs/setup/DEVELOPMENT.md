# Development

Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + Shadcn/ui
- Supabase (Auth, Postgres, Realtime)

Scripts
- npm run dev          # Start dev server (http://localhost:5173)
- npm run build        # Production build
- npm run preview      # Preview production build
- npm run lint         # ESLint

Project Structure
src/
- components/  UI and feature components
- contexts/    Global state (Auth, Kiosk)
- hooks/       Data + domain hooks (queue, sessions, students)
- pages/       Routes
- integrations/ Supabase client
- lib/         Utilities

Realtime
- Queue updates, session monitor, kiosk status are realtime via Supabase channels.
- Test by opening two browser windows.

Debugging
- Browser DevTools (Console, Network)
- Supabase Dashboard (SQL editor, auth, logs)

Notes
- Supabase client is preconfigured; no .env needed for development.
- Follow design system tokens in index.css and tailwind.config.ts.
- Use hooks/use-toast for notifications.

# Installation

This project runs without environment variables. Supabase is preconfigured in src/integrations/supabase/client.ts.

Prerequisites
- Node.js 18+
- npm
- Git

Quick Start
1) Clone and install
   - git clone [repository-url]
   - cd bx-os
   - npm install
2) Run the app
   - npm run dev
   - Open http://localhost:5173

Demo Accounts (optional)
- Teacher: teacher@school.edu / teacher123
- Admin: admin@school.edu / admin123

Notes
- Auth, DB, and realtime are provided by Supabase; no local DB required.
- For production deployments, see docs/setup/DEPLOYMENT.md.
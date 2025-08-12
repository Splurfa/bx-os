# Quickstart

Follow these steps to get the app running locally and validate key flows.

1) Install and run
- npm install
- npm run dev
- Open http://localhost:5173

2) Sign in
- Use your own account or demo accounts (see Deployment doc)
- Access Admin Dashboard at /admin-dashboard

3) Kiosk management
- Toggle kiosks on/off using the switch
- "Activated" time displays on each card

4) Queue workflow (smoke test)
- Add a Behavior Support Request (BSR) from Teacher Dashboard
- Watch it appear in Queue Display
- Approve or Request Revision; verify state updates in real-time

5) Sessions
- Session Monitor lists active sessions (Location column removed)

Troubleshooting
- If data doesn’t update, refresh the page
- Check browser console for errors
- Ensure Supabase is reachable (status.supabase.com)

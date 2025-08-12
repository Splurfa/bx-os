# Operations Runbook

Audience: Admins and Ops

Daily tasks
- Verify kiosks are active as needed (Admin Dashboard → Kiosk Management)
- Monitor sessions and queue health
- Clear teacher queues when requested (Queue Display → Clear Queue)

Kiosk controls
- Toggle a kiosk via the switch on its card
- Deactivate all kiosks via the "Deactivate All" button

Queue actions (smoke test)
- Add BSR (Teacher Dashboard)
- Approve or request revision
- Clear queue and confirm entries disappear

Incident response
- If a kiosk is stuck, deactivate and reactivate it
- If queues won’t clear, reload the page and retry
- Check browser console and Supabase status; escalate if persistent

Rollback notes
- UI changes limited to SessionMonitor and AdminDashboard; revert via git if needed
- RLS policies can be reverted by dropping the policy (none added in this iteration)

# Pre-Production Checklist

Status: In progress
Owner: PM (with Dev + QA support)

1. Functional completeness
- [ ] Admin User Management: create, role change, delete flows verified end-to-end
- [ ] Kiosk flows: start → reflect → complete → review → archive
- [ ] Queue ops: add, assign, reassign, clear teacher/all queues
- [ ] Session tracking: start/end/idle updates

2. Data integrity & security
- [ ] RLS policies validated for all user-facing tables
- [ ] SECURITY DEFINER functions reviewed (inputs validated, least privilege)
- [ ] Triggers audited (no recursion, correct timing)
- [ ] Backups enabled and restorable

3. Performance & reliability
- [ ] Realtime channels: unsubscribed on unmount; no memory leaks
- [ ] N+1 queries avoided; indexes exist on hot paths
- [ ] Edge functions: timeouts, error handling, CORS
- [ ] Rate limits understood; retry logic where appropriate

4. UX & accessibility
- [ ] Mobile layout verified on common breakpoints
- [ ] a11y: labels, focus states, keyboard nav
- [ ] Empty/Loading/Error states consistent
- [ ] Toasts disabled for QA; non-blocking feedback ensured where critical

5. PWA & SEO
- [ ] Manifest/icons/viewport verified
- [ ] Lazy loading of images; defer non-critical scripts
- [ ] Canonicals and title/meta descriptions present where applicable

6. Observability
- [ ] Console/log noise removed
- [ ] Edge/function logs checked; structured logs present
- [ ] Error boundaries cover critical routes

7. Compliance & legal
- [ ] Privacy policy and data retention reviewed
- [ ] Audit trail sufficient for admin actions

8. Release readiness
- [ ] Versioning/tagging plan
- [ ] Rollback strategy
- [ ] Owner on-call for first 24h

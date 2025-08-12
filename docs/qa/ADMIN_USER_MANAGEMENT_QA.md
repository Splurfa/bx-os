# Admin User Management – QA Results

Environment: Preview
Toasts: Disabled

Test cases
1. Create user (email+password+name+role)
- Action: Invoke create-user edge function via UI
- Expected: profiles row created with correct fields; table refresh shows new user
- Result: PASS

2. Change role (teacher ↔ admin)
- Action: Update profiles.role via UI action
- Expected: DB updates; UI refresh reflects new role badge
- Result: PASS

3. Delete user
- Action: Invoke create-user edge function with action=delete
- Expected: Auth user deleted; profiles row removed; UI refresh hides user
- Result: PASS

4. Validation – missing fields on create
- Action: Submit with missing email/password/name
- Expected: Operation blocked; no DB writes
- Result: PASS

5. Error handling – edge/API error
- Action: Simulate network/error
- Expected: Operation fails gracefully; no crash; UI remains usable
- Result: PASS

Notes
- With toasts disabled, verification is via table updates and dialogs
- All actions trigger fetchUsers() to refresh state after success

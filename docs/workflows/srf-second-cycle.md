# Second “try again” SRF cycle

- Definition: Triggered when a teacher requests a revision on a reflection.
- Privacy: Teacher feedback is hidden on kiosk welcome; shown only after password within the authenticated form.
- Review: The latest reflection version is displayed in the Review Modal; approval is enabled when responses are present.

```mermaid
sequenceDiagram
  autonumber
  participant T as Teacher
  participant BR as behavior_requests
  participant R as reflections
  participant RH as reflections_history
  participant K as Kiosk

  T->>R: Update status to revision_requested with feedback
  R-->>RH: Trigger archives OLD reflection (attempt_n + 1)
  T->>BR: Set status=waiting; kiosk_status=waiting; assigned_kiosk_id=null
  BR->>K: Reassignment picks next active kiosk
  K->>Student: Welcome (no feedback visible)
  Student->>K: Enters password
  K->>Student: Shows feedback + form
  Student->>R: Submit new reflection (pending)
  R->>BR: Set status=review; kiosk_status=completed
  T->>R: Review latest reflection; Approve or Request Revision
```


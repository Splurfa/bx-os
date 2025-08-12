# Documentation Refresh Plan

Goal: Replace outdated/duplicate docs with a clean, current set aligned to the codebase.

Scope to replace
- docs/setup/INSTALLATION.md → Re-write
- docs/setup/DEVELOPMENT.md → Re-write
- docs/setup/DEPLOYMENT.md → Re-write
- docs/technical/FRONTEND.md → Update to current architecture
- docs/technical/DATABASE.md → Update functions, RLS, triggers
- docs/README.md → Consolidate, point to new structure

Actions
1. Inventory current docs and mark duplicates/outdated sections
2. Author new canonical setup docs (installation, development, deployment)
3. Update technical docs for current data model and edge functions
4. Remove deprecated/duplicate files after replacement
5. Add QA playbooks for key flows (admin, kiosks, queues)

Deliverables
- A single top-level README pointing to the refreshed docs
- Clean setup guides that match the live code
- Technical references aligned with Supabase schema and functions

Notes
- Keep docs concise; avoid drift by linking to code where possible
- Prefer task-based guides over long narratives

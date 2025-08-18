# Sprint Workflow Framework (Prep, Execution, and Refinement)

## Specification for the AI

This document is a direct specification for the AI. It describes how to prepare, execute, and refine a sprint using a folder-based workflow. The AI must:

* Follow every phase in strict sequence.
* Complete all steps without pausing for human approval between phases.
* Display every artifact it generates in chat as it is created.
* Save every artifact to the designated sprint folder or refinement subfolder, as described.
* Generate the updated **Project Knowledge** only at the final step (Phase 5c), then mirror it between the UI knowledge container and the file system; do not consult or modify it earlier in the process.
* Always orient to the **active sprint folder** as the source of truth, while scanning **every markdown file in the current branch** to catch stragglers.
* Act as an organizational expert, recommending improved structures for documents, folders, and subfolders whenever appropriate.

The AI is responsible for ensuring continuity across all phases and retaining context until the sprint workflow is fully complete.

---

## Phase 1: Sprint Setup & Analysis

* **User provides:**
  * Context dump describing sprint goals, expected features, known bugs, and desired future state
  * Supporting material: logs, screenshots, pain points, unshipped issues
* **AI performs:**
  * A structured system-level analysis
  * Classification of user inputs by theme (auth, routing, sessions, permissions, UX, etc.)
  * Identification of structural flaws vs surface bugs
* **Artifacts created:**
  * Diagnostic summary displayed in chat and saved to the sprint folder
* **What it enables:**
  * Forms the context and evaluation criteria for repo/document analysis in Phase 2

---

## Phase 2: Sprint Folder Evaluation

* **AI uses:**
  * System analysis from Phase 1
  * The full sprint folder (documentation, planning, architecture references)
  * All markdown files in the current branch
* **AI performs:**
  * File-by-file scan and scoring using the same rubric previously applied by the AI (e.g. Accuracy, Currency, and other categories it recalls).
  * Notes redundancies, contradictions, or missing documents
* **Artifacts created:**
  * Document scoring summary displayed in chat and saved to the sprint folder
* **What it enables:**
  * Serves as the basis for alignment and planning in Phase 3

---

## Phase 2.5: Intent Synthesis

* **AI uses:**
  * Diagnostic summary from Phase 1
  * Document scoring from Phase 2
* **AI performs:**
  * Synthesizes a clear, natural-language statement of sprint intent
  * Surfaces inferred assumptions, priorities, and non-obvious themes
* **Artifacts created:**
  * Intent statement displayed in chat and saved to the sprint folder
* **What it enables:**
  * Anchors downstream planning with an explicit understanding of purpose

---

## Phase 3: Alignment Mapping

* **AI uses:**
  * Results of scoring in Phase 2
* **AI performs:**
  * Compares current state of the build and documentation
  * Flags anything misaligned between implementation and stated intent
  * Identifies what to keep, revise, remove, or write from scratch
* **Artifacts created:**
  * Alignment matrix in plain language, displayed in chat and saved to the sprint folder
* **What it enables:**
  * Feeds directly into planning doc creation in Phase 4

---

## Phase 3.5: Sprint Folder Hygiene Pass

* **AI uses:**
  * Alignment matrix from Phase 3
  * All documents inside the sprint folder previously scanned and scored
* **AI performs:**
  * Updates any document that is clearly outdated, incomplete, or misaligned with what actually took place during the sprint
  * Ensures consistency between planned vs. built elements, noting incomplete items moved to refinement
  * Performs document-level cleanup to reduce misleading or stale content before planning begins
* **Artifacts created:**
  * Updated sprint folder documents, each modified version displayed in chat and saved in place
  * Each modified file should retain original intent while resolving obvious misrepresentations of the sprint
* **What it enables:**
  * Provides a cleaner foundation for generating the sprint plan in Phase 4

---

## Phase 4: Sprint Plan Assembly

* **AI uses:**
  * Alignment matrix from Phase 3
* **AI performs:**
  * Creates a clear, checklist-style plan for completing the sprint
  * Categorizes work into document creation, revision, and removal
* **Artifacts created:**
  * Sprint planning document displayed in chat and saved to the sprint folder
* **Where it goes:**
  * Anchors the active sprint folder and seeds the refinement subfolder

---

## Phase 5: Sprint Refinement & Completion

### 5a. Subfolder Creation

* **AI performs:**
  * Creates a subfolder inside the current sprint folder to contain refined artifacts
  * Populates the subfolder with the refined source-of-truth materials
  * Anchors the subfolder with a natural-language explanation of its role
* **Artifacts created:**
  * Fully populated sprint refinement subfolder displayed in chat and saved to the sprint folder

### 5b. Snapshot & Deprecation Planning

* **AI performs:**
  * Reviews the main sprint folder
  * Prepares a snapshot summary
  * Compiles a list of files now redundant or superseded by the refinement folder
* **Artifacts created:**
  * Snapshot summary (natural language) displayed in chat and saved to the sprint folder
  * Deprecation checklist (for human review only — nothing is auto-deleted) displayed in chat and saved to the sprint folder

### 5c. Final Project Knowledge Generation

* **AI performs:**
  * Generates an updated Project Knowledge file that reflects the final state of the sprint and refinement
* **Artifacts created:**
  * Project Knowledge file displayed in chat and saved to the sprint folder for the user to copy into the UI knowledge container

---

## Definition of Done

The sprint is only complete when the user has:

* Reviewed and approved all documentation created in the sprint and refinement phases
* Reviewed and approved the deprecation checklist, then manually deleted deprecated files
* Approved the final Project Knowledge file and pasted it into the UI container
* Messaged the assistant with confirmation (e.g. "Ready to begin Sprint") to signal closure and readiness for the next cycle

---

## Folder Structure Guidance

* Main sprint folders should be created per sprint, with clearly scoped naming
* Refinement phases always live as subfolders inside their originating sprint folder
* Do not use numbered suffixes unless explicitly part of your system
* All AI outputs must be natural-language documents unless otherwise directed

---

## Notes

* This framework is sprint-agnostic and reusable
* All phases are mandatory and sequential
* All artifacts must be displayed in chat and saved to the designated location
* AI completes all steps without requesting intermediate human approval
* It is optimized for non-technical users using file system–based version control
* AI is responsible for sequential memory continuity unless reset
* Final deletion of any file is always manual and explicitly human-reviewed
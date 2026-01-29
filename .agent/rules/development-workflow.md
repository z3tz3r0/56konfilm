---
trigger: always_on
---

# Development Workflow (BMAD)

This project strictly follows the **BMAD** agentic workflow. Do not deviate from these command sequences.

## Sprint Lifecycle

### 1. Planning Phase
**Trigger:** Before starting a new sprint (after Epics are sharded).
- **Command:** `/sprint-planning`
- **Output:** Generates `sprint-status.yaml`.
- **Goal:** To convert the "Static Plan" (Epics) into a "Living Backlog".

### 2. Daily Execution
**Trigger:** Every morning or before starting work.
- **Command:** `/sprint-status`
- **Goal:** To check progress and identify the "Next Up" story.

### 3. Implementation Loop (The "Story" Cycle)
**Strict Rule:** Complete one story at a time.
1.  **Select Story:** Pick from `sprint-status.yaml`.
2.  **Write Tests (Red):** 
    - **Command:** `/testarch-atdd`
    - **Goal:** Write failing E2E tests (Playwright) that define the Acceptance Criteria.
3.  **Implement (Green):**
    - **Command:** `/dev-story`
    - **Goal:** Write code to make the tests pass.
4.  **Review:**
    - **Command:** `/code-review`
    - **Goal:** Adversarial review (Sustainability, Security, Perf).

### 4. Quality Gates
**Trigger:** After completing an Epic or Major Feature.
- **Performance/SEO:** 
  - **Command:** `/testarch-nfr`
  - **Goal:** Validate Lighthouse 100/100, LCP < 2.5s.
- **Traceability:**
  - **Command:** `/testarch-trace`
  - **Goal:** Verify all PRD requirements have corresponding tests.

### 5. Closure
**Trigger:** End of project or major milestone.
- **Command:** `/retrospective`

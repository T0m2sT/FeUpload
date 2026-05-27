# Sprint Retrospectives

This file records sprint retrospectives with verifiable action points.

## Sprint 0 Retrospective

### What went well

- Team aligned on product vision and initial scope.
- Base navigation and initial prototype delivered.

### What did not go well

- Too much time spent debating feature scope.
- Some backlog items were too broad at start.

### Improvement strategy (verifiable)

| Action                                                  | Owner                 | Verification                                           |
| ------------------------------------------------------- | --------------------- | ------------------------------------------------------ |
| Split large backlog items before Sprint Planning        | Whole team            | Sprint Backlog contains no epic-sized items            |
| Add DoR checklist before moving items to Sprint Backlog | Scrum lead for sprint | Every selected item has acceptance criteria + estimate |
| Limit parallel work to reduce pauses                    | Whole team            | At most one active item per pair/trio                  |

## Sprint 1 Retrospective

### What went well

- Increment delivered with clear user-facing value (database-backed features, exam access).
- Better collaboration in pairs/trios on key features.

### What did not go well

- Traceability of Scrum artifacts in the repo was incomplete.
- Some quality gates were added before baseline was fully stable.

### Puzzles

- We couldn't get the GitHub Actions to work because there were no credits, so we weren't able to learn how to use it.

### Improvement strategy (verifiable)

| Action                                                 | Owner              | Verification                                                  |
| ------------------------------------------------------ | ------------------ | ------------------------------------------------------------- |
| Register Sprint Review notes in repo after each sprint | Sprint facilitator | `misc/scrum/sprint-review.md` updated every sprint            |
| Register retrospective notes and action status in repo | Sprint facilitator | `misc/scrum/sprint-retrospective.md` updated every sprint     |
| Use Yesterday’s Weather for sprint scope               | Whole team         | Planned points do not exceed previous sprint delivered points |
| Assign Sprint Backlog items only when started          | Whole team         | Board shows assignee added at `In Progress`                   |
| Keep WiP low (no paused queues)                        | Whole team         | Board has minimal paused items and fast cycle time            |

## Sprint 2 Retrospective

### What went well

- We did a very good progress on our APP
- Improvement in our communication
- Better organization in our scrum board

### Do differently 

- We underestimated the effort points for the issues defined during sprint planning because we did not take the academic week into account. The effort points we initially assigned were significantly lower than the actual effort required to complete the work. In future sprints, we should better evaluate team availability and workload before planning and estimating tasks.

### Puzzles

- We don't understand why the github actions for maestro is always failing.

### Improvements compared to last sprint
- We significantly improved our use of the Scrum board. As mentioned previously, we assigned issues to team members and moved them to In Progress when work started. This led to faster communication regarding ongoing tasks and provided a better understanding of the current status of the project.

## Sprint 3 Retrospective

### What went well

- Successfully delivered the AI study tools feature (summaries, flashcards, PDF Q&A), which was the most ambitious item in the backlog.
- Offline support was fully resolved across sessions and platforms after earlier instability.
- Team collaboration improved further; most features were reviewed and merged via pull requests with clear scope.
- UX polish items (autocomplete, solved toggle, forum labels, branding) were completed alongside the main AI feature.

### What did not go well

- Maestro (end-to-end) tests continued to fail in CI, which means we could not rely on automated E2E validation.
- Some fixes were reactive (e.g. TypeScript errors, icon order, navigation loops) rather than caught during development.
- The volume of small bug-fix commits suggests that some items were not fully tested before merging.

### Puzzles

- We still do not understand why the GitHub Actions Maestro runner is consistently failing. It may be an environment or emulator issue outside our control.

### Improvement strategy (verifiable)

| Action                                                   | Owner      | Verification                                                    |
| -------------------------------------------------------- | ---------- | --------------------------------------------------------------- |
| Investigate and document root cause of Maestro CI failure | Whole team | Issue created with findings; workaround or fix applied          |
| Add a pre-merge checklist (lint + unit tests pass locally) | Whole team | Fewer reactive fix commits in next sprint git log               |
| Keep sprint items small enough to test before merging    | Whole team | No item merged without at least one acceptance test or unit test |

### Improvements compared to last sprint

- Sprint planning followed Yesterday's Weather more closely; delivered features matched planned scope better than Sprint 2.
- Scrum board usage remained disciplined: assignees set at In Progress, no large paused queues observed.
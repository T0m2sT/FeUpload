# Sprint Review Notes

This file records Sprint Reviews and the resulting backlog adaptation decisions.

## Sprint 0 Review

### Demonstrated increment
- Initial product navigation (Home, Exercises, Exams, Upload).
- Basic material opening flow.
- Initial upload form.

### Stakeholders present
- Team members.
- Teacher (invited to review during class/lab review moments).

### Feedback received
- Improve usability and visual consistency.
- Move from static data to database-backed content.
- Improve testability and quality gates.

### Product Backlog adaptation
- Prioritize database integration for core screens.
- Add course-scoped organization (materials per course/section).
- Add testing and CI as near-term backlog items.

## Sprint 1 Review

### Demonstrated increment
- Database integration in key user flows (home/classes and threads).
- Course sections and access to old exams.
- In-app PDF viewing support and profile improvements.
- Initial automated tests and CI workflow.

### Stakeholders present
- Team members.
- Teacher (reviewed increment and repository artifacts).

### Feedback received
- Strengthen Scrum artifact traceability in repository.
- Keep Sprint Backlog item sizing small and measurable.
- Improve release notes to focus on end-user value and closed PBIs.

### Product Backlog adaptation
- Add explicit DoR and planning rules to documentation.
- Add Sprint Review and Sprint Retrospective logs with action tracking.
- Continue hardening test coverage and stabilize CI checks.

## Sprint 2 Review

### Demonstrated increment
- Integrated the database to support material uploads.
- Added several quality-of-life features, such as bookmarks, ratings, and a download button.
- Implemented the login and registration system.

### Stakeholders present
- Team members.
- Teacher (reviewed increment and repository artifacts).

### Feedback received
- Continue improving the user experience.

### Product Backlog adaptation
- Prioritize additional user experience improvements based on feedback received.
- Add new backlog items related to usability and interface enhancements.
- Refine and update existing backlog items according to sprint outcomes.

## Sprint 3 Review

### Demonstrated increment
- AI study tools: AI-generated summaries, flashcards, and PDF Q&A powered by Gemini edge function.
- Offline materials: download indicator, offline access across sessions and platforms, dedicated Documents screen.
- Solved/unsolved toggle on Exams and Exercises screens with checkmark indicator on material list.
- Forum improvements: labels on posts with filter support, delete post button.
- Upload improvements: "Tem soluções?" toggle, pre-selected course when navigating from a course section, rule-based filename tag suggestions.
- Search autocomplete on material search.
- Collection management: enable/disable collections, fix deletion on web.
- App logo integrated and branding aligned across main and course screens.
- Bug fixes: offline file access, thread navigation, PDF viewer dark theme, sort order for exams/summaries.

### Stakeholders present
- Team members.
- Teacher (reviewed increment and repository artifacts).

### Feedback received
- Keep improving test coverage for new AI features.
- Continue polishing the user experience and accessibility.

### Product Backlog adaptation
- Add any remaining AI feature polish (e.g. flashcard regeneration UX) to the backlog.
- Evaluate expanding offline support to additional content types.
- Improve Maestro CI reliability for end-to-end tests.
# Changelog

All notable changes to this project are documented in this file.

## [Sprint 0] - Initial Increment

### End-user value
- First usable app navigation with Home, Exercises, Exams, and Upload screens.
- Users can open uploaded files in the browser.
- Users can submit material using the initial upload form.

### Closed PBIs (implemented in this increment)
- Base multi-screen navigation.
- File opening flow from app content.
- Initial upload form and screen.

## [Sprint 1]

### End-user value
- Students can browse course-specific content with a clearer navigation flow (course page + sections).
- Students can access older exam materials directly from the course context.
- Students can use discussion threads with database-backed data instead of static placeholders.
- The app experience is more complete with profile, improved UI, and in-app PDF viewing support.

### Closed PBIs (implemented in this increment)
- Dynamic home page classes integrated with database (PR #46).
- Threads page integrated with database (PR #47).
- Acceptance-test scenarios added for core behaviors (PR #52).
- Access to old exams implemented (PR #56).
- Unit testing suite and Jest setup implemented/improved (PR #57).

### Quality and delivery notes
- CI workflow added to run lint and tests on pull requests and pushes to `main`.


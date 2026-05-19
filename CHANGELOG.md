# Changelog

All notable changes to this project are documented in this file.

## Sprint 0 - Initial Increment

### End-user value
- First usable app navigation with Home, Exercises, Exams, and Upload screens.
- Users can open uploaded files in the browser.
- Users can submit material using the initial upload form.

### Closed PBIs (implemented in this increment)
- Base multi-screen navigation.
- File opening flow from app content.
- Initial upload form and screen.

## Sprint 1

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

## Sprint 2

### End-user value
- Students can register and log into the platform using a database-backed authentication flow.
- Students can complete and manage their academic profile information directly in the app.
- Students can browse and rate materials with ratings persisted and synchronized through Supabase.
- Students can access bookmarks, summaries, annotations, and uploaded materials in a more complete study workflow.
- Students can use discussion forums with improved compatibility and in-app PDF support.
- The application UI is now more consistent and polished across newly added screens and features.
- Android build support and browser compatibility issues were fixed, improving cross-platform usability.

### Closed PBIs (implemented in this increment)
- Database-backed login flow implemented (PR #80).
- User registration/account creation implemented (PR #80).
- Profile Completion screen implemented (PR #81).
- Material ratings screen integrated and improved (PR #70).
- Material rating submission and visualization implemented (PR #90).
- Register field validation and filtering added (PR #92).
- Exercises visualization issues fixed (PR #68).
- Browser compatibility fixes implemented (PR #67).
- In-app PDF opening flow fixed/improved (PR #63).
- Bookmarks feature implemented (PR #83).
- Materials upload flow implemented (PR #93).
- Access to summaries and annotations implemented (PR #96).
- UI refactor and consistency improvements completed (PR #82).
- General readability, correctness, and code quality refactor completed (PR #98).
- GitHub Actions workflow improvements and CI enhancements implemented.
- Android build issues fixed (PR #65).
- Database connection/integration improvements completed (#51).

### Quality and delivery notes
- Acceptance-test coverage expanded for login, registration, profile completion, ratings, forums, and bookmarks flows (PRs #85 and #97).
- CI/CD workflows and GitHub Actions pipeline improved for better delivery reliability.
- Refactoring work focused on improving maintainability, UI consistency, and overall code quality.
- Additional validation and error-handling logic added across authentication and profile-related flows.

## Sprint 3 
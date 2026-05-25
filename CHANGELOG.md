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

### End-user value
- Students can filter and sort course materials by rating or academic year, with exams correctly ordered by year.
- Students can toggle between a material and its resolution directly inside the PDF viewer.
- Students can get an AI-generated summary of any PDF material with a single tap, powered by Gemini.
- The upload form auto-suggests title, type, and academic year based on the uploaded filename, reducing manual input.
- Forum posts can be labelled and filtered, making it easier to find relevant discussions.
- The bookmarks section has improved spacing and collection management.
- Material detail screens show cleaner metadata with a clickable rating count linking to reviews.

### Closed PBIs (implemented in this increment)
- Forum post labels and filtering implemented (PR #114).
- Material widget refactored for consistency (PR #113).
- Upload form course pre-selection from course section navigation (PR #112).
- Selector refactor for year, semester, and course pickers (PR #111).
- Material filtering by rating and date added to exams and exercises (PR #108).
- Dual PDF buffer (file + resolution) with in-viewer toggle implemented (PR #107).
- Bug fixes: bookmarks header padding, forum placeholder alignment, collection view top padding (PR #116).
- AI PDF summarization via Gemini edge function added to material and summary screens.
- Rule-based filename tag suggestions added to the upload form.
- Session-level AI summary cache added to avoid redundant API calls.
- Exams date sort fixed to use academic year instead of upload date.
- Pre-existing TypeScript compilation errors resolved across multiple screens.

### Quality and delivery notes
- Supabase edge function deployed for AI summarization (Gemini 2.5 Flash Lite).
- Markdown rendering added to AI summary output via react-native-markdown-display.
- Deno-based edge functions excluded from the TypeScript project to prevent compiler errors.

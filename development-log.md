# Development Log — ESOF TPC3 Individual Assignment

**Author:** Tomás Teixeira
**Course:** ESOF — Software Engineering, FEUP 2025/2026
**Date:** 30 March 2026
**Assignment:** Automated Acceptance Testing for the team's mobile app (FeUpload)

---

## Goal

Implement an automated acceptance test for the "Access Course Page" scenario of the team's mobile app (FeUpload). The test verifies that a student can navigate from the Home screen to a specific course page and see its study materials. The tool used for automation is Maestro, a mobile UI testing framework that uses YAML-based flow definitions.

---

## Session Log

### Step 1 — Understand the assignment and team context

**Goal:** Identify what has been done by other team members and pick an unclaimed scenario.

**Method:** Pulled the latest code from the team repository and inspected existing branches to see which screens and testing approaches each teammate had claimed.

**Commands run:**

```bash
cd ~/Documents/LEIC/2A2S/ESOF/T2
git pull
git diff main...origin/Rafael-Silva-tpc3 --name-only
git diff main...origin/Tiago-Su-tpc3 --name-only
git diff main...origin/francisco-mendes-tpc3 --name-only
```

**Findings:**

| Teammate | Screen | Tool |
|---|---|---|
| Rafael Pinho e Silva | Exams | Maestro (YAML) |
| Tiago Su | Exercises | Maestro (YAML) |
| Francisco Mendes | Upload | Jest + React Native Testing Library |

**Decision:** The Home screen was unclaimed. The scenario "Access Course Page" — navigating from a course list to a course detail page with study materials — was a natural fit and aligned with the app's core user stories (browsing materials by course/subject).

---

### Step 2 — Research Maestro as the testing tool

**Goal:** Understand how Maestro works and confirm it is compatible with Expo/React Native.

**Method:** Reviewed teammates' existing Maestro YAML files to understand the syntax and conventions used within the project.

**Key findings:**
- Maestro uses simple YAML flows with actions like `launchApp`, `tapOn`, `assertVisible`
- The `appId` must match the app's bundle identifier (found in `app.json` as `com.anonymous.feupload`)
- The app must be installed natively on the simulator (not through Expo Go) for Maestro to control it — this requires `npx expo run:ios` instead of `npx expo start --ios`
- React Native's accessibility grouping can prevent Maestro from finding individual text elements inside touchable containers — `testID` and `accessibilityLabel` props are needed to make elements detectable

**Sources:**
- Teammates' `.maestro/` YAML files in the repository
- Maestro documentation: https://maestro.mobile.dev

---

### Step 3 — Create personal branch

**Goal:** Set up a dedicated branch for this assignment.

**Commands run:**

```bash
cd ~/Documents/LEIC/2A2S/ESOF/T2
git checkout -b pedro-teixeira-tpc3
```

---

### Step 4 — Implement the Home screen (course list)

**Goal:** Replace the placeholder Home screen with a list of FEUP courses that students can tap to navigate to a course detail page.

**File modified:** `app/(tabs)/index.tsx`

**Implementation:** Used Claude Code as an AI assistant to generate the initial filling of the courses details. The screen displays a `FlatList` of courses (Software Engineering, Databases, Computer Networks, Algorithms and Data Structures, Operating Systems), each rendered as a card with the course code, name, and year. Tapping a card navigates to a dynamic route (`/course/[id]`). Also asked for help when having trouble with specific steps inside the test.

**Prompt used with Claude Code:**
> Provided access to my LEIC folder for it to fetch the names of the courses. Because I only have the initials as the folder's name, it made up some of them so I had to go bad and change them.

> Provided the TPC3 assignment context and asked for help implementing the "Access Course Page" acceptance test scenario.

**Key implementation details:**
- Each `TouchableOpacity` card includes `testID={`course-${item.id}`}` and `accessibilityLabel={item.name}` to ensure Maestro can locate elements despite React Native's accessibility grouping
- Navigation uses `expo-router`'s `useRouter().push()` with dynamic route parameters

```tsx
<TouchableOpacity
  style={styles.card}
  onPress={() => router.push(`/course/${item.id}`)}
  testID={`course-${item.id}`}
  accessibilityLabel={item.name}
>
  <Text style={styles.courseCode}>{item.code}</Text>
  <Text style={styles.courseName}>{item.name}</Text>
  <Text style={styles.courseYear}>Year {item.year}</Text>
</TouchableOpacity>
```

---

### Step 5 — Implement the course detail page

**Goal:** Create a dynamic route that displays a course's name, code, and list of study materials.

**File created:** `app/course/[id].tsx`

**Implementation:** The screen reads the `id` parameter from the URL, looks up the corresponding course data, and renders:
- A back button
- The course code and full name
- A "Study Materials" section with a list of materials, each tagged by type (Notes, Exam, Exercises) with colour-coded badges

**Route registered in:** `app/_layout.tsx` — added `<Stack.Screen name="course/[id]" options={{ headerShown: false }} />`

---

### Step 6 — Write the Maestro acceptance test

**Goal:** Automate the "Access Course Page" scenario using Maestro.

**File created:** `.maestro/access_course_page.yaml`

**Acceptance test scenario (Gherkin format):**

```gherkin
Feature: Access Course Page

  Scenario: Student navigates to a course page and sees its materials
    Given I open the FeUpload app and I am on the Home screen
    When I tap on the "Software Engineering" course
    Then I see the course page for Software Engineering
    And I can see the list of study materials for that course
```

**Maestro YAML implementation:**

```yaml
appId: com.anonymous.feupload
---
- launchApp:
    clearState: true

# Given: Home screen is visible with the courses list
- assertVisible: "Courses"
- extendedWaitUntil:
    visible:
      id: "course-1"
    timeout: 10000

# When: Student taps on the Software Engineering course
- tapOn:
    id: "course-1"

# Then: Course page is displayed
- extendedWaitUntil:
    visible: "Study Materials"
    timeout: 10000

# And: Course details and materials are shown
- assertVisible:
    id: "course-code"
- assertVisible:
    id: "section-header"
- assertVisible:
    id: "material-m1"
- assertVisible:
    id: "material-m2"
- assertVisible:
    id: "material-m3"
```

---

### Step 7 — Build the app and run the test

**Goal:** Compile the app natively, install it on the iOS Simulator, and execute the Maestro test.

**Commands run:**

```bash
# Install dependencies
cd ~/Documents/LEIC/2A2S/ESOF/T2
npm install

# Build and install natively on iOS Simulator
# (required for Maestro — Expo Go does not work)
npx expo run:ios

# Run the Maestro acceptance test (separate terminal)
maestro test .maestro/access_course_page.yaml
```

**Issues encountered and resolved:**

1. **Expo Go incompatibility:** Running `npx expo start --ios` launches the app inside Expo Go, which does not install the app with the bundle ID `com.anonymous.feupload`. Maestro could not find the app binary. **Fix:** Used `npx expo run:ios` to build and install the app natively.

2. **React Native accessibility grouping:** Maestro could not find "Software Engineering" text even though it was visually on screen. React Native's `TouchableOpacity` groups child elements into a single accessibility node, making individual text elements invisible to Maestro. **Fix:** Added `testID` and `accessibilityLabel` props to all touchable elements and used Maestro's `id` selector instead of text matching.

3. **Same issue on course detail page:** Material cards also grouped their text. **Fix:** Added `testID` props to material card `View` components and used `id` selectors in the YAML.

---

### Step 8 — Record demo video

**Goal:** Capture a screen recording of the Maestro test running against the app.

**Tool used:** macOS screen recording (`Cmd + Shift + 5`)

**Video content:** Shows the Maestro CLI executing each step of the acceptance test flow, with the iOS Simulator displaying the app navigating from the Home screen to the Software Engineering course page.

---

### Step 9 — Commit and push

**Goal:** Push all changes to the team repository on the personal branch.

**Commands run:**

```bash
cd ~/Documents/LEIC/2A2S/ESOF/T2
git add app/(tabs)/index.tsx app/_layout.tsx app/course/[id].tsx .maestro/access_course_page.yaml
git commit -m "feat: Home screen course list and course page with acceptance test"
git push -u origin pedro-teixeira-tpc3
```

---

## Materials and Tools Used

| Tool | Purpose | Link |
|---|---|---|
| Maestro | Mobile UI testing framework (YAML-based) | https://maestro.mobile.dev |
| Expo / React Native | Mobile app framework | https://expo.dev |
| expo-router | File-based routing for React Native | https://docs.expo.dev/router/introduction/ |
| Xcode / iOS Simulator | Native build and simulator | Mac App Store |
| Claude Code | AI assistant: code generation, debugging Maestro issues | https://claude.ai/claude-code |
| VS Code | Code editor | https://code.visualstudio.com |
| Git / GitHub | Version control and collaboration | https://github.com |

---

## Critical Analysis

### What went well

**Maestro is remarkably simple.** The YAML-based syntax is intuitive and requires no boilerplate code. Writing an acceptance test took minutes, not hours. Compared to Detox or Appium, the setup cost is near zero — install the CLI, write a YAML file, run one command.

**Teammates' existing tests served as a template.** Because Rafael and Tiago had already written Maestro tests for the same app, their YAML files provided an immediate reference for syntax, `appId`, and project conventions. This eliminated the need for extensive documentation reading.

**Claude Code accelerated implementation.** Using the AI assistant to generate the Home screen component, course detail page, and initial Maestro YAML saved significant time. The code was functional on the first iteration, requiring only adjustments for Maestro's element detection limitations.

**Debugging was visual and fast.** Maestro saves screenshots at each failure point, which made it trivial to diagnose issues. The screenshot clearly showed the text was on screen, pointing directly to an accessibility detection problem rather than a rendering bug.

### Challenges encountered

**React Native accessibility grouping was the main obstacle.** This was the most time-consuming issue. React Native groups child elements of touchable components into a single accessibility node by default. Maestro searches the accessibility tree, not the visual pixel output, so text that is clearly visible on screen can be invisible to the test framework. The fix — adding `testID` props — is simple but not obvious without prior experience.

**Expo Go vs native build distinction.** The first attempt to run Maestro failed because the app was running inside Expo Go rather than as a standalone native binary. This is a subtle but critical distinction: `npx expo start --ios` ≠ `npx expo run:ios`. The error message from Maestro ("failed to get app binary directory") was informative enough to diagnose this quickly.

**iOS Simulator network timeout.** An initial attempt with `npx expo start --ios` produced a timeout error (`Operation timed out`) when trying to open the Expo URL in the simulator. This was resolved by switching to the native build approach (`npx expo run:ios`), which bypasses the network entirely.

### Reflection on GenAI-assisted development

Claude Code was used extensively in this assignment — for debugging the accessibility detection issues. This is a shift from TPC1 and TPC2, where it was used primarily as a reviewer.

The AI was most valuable when debugging the Maestro failures. After each failed test run, providing the error output and screenshots allowed Claude Code to quickly identify the root cause (accessibility grouping) and suggest the correct fix (`testID` props + `id` selectors). This iterative debug loop — run test → paste error → get fix → retry — was faster than manual documentation searching.

**Limitation observed:** Claude-Code initially told me to use text-based selectors (`assertVisible: "Software Engineering"`), which seemed correct but failed due to React Native's internal accessibility behaviour. This highlights that AI tools can produce syntactically valid but semantically incorrect output when platform-specific edge cases are involved. The fix required understanding *why* Maestro couldn't find the element, not just *what* selector to use.

### Estimated time breakdown

| Activity | Time |
|---|---|
| Repository setup and teammate analysis | ~15 min |
| Maestro research and understanding | ~15 min |
| Home screen and course page implementation | ~60 min |
| Maestro YAML writing | ~10 min |
| Debugging Maestro element detection issues | ~45 min |
| Native build and test execution | ~20 min |
| Development log writing | ~30 min |
| Video recording | ~10 min |
| **Total** | **~3h 25 min** |

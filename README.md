# **FeUpload** Development Report

Welcome to the documentation of **FeUpload**!

This Software Development Report, tailored for LEIC-ES-2025-26, provides comprehensive details about **FeUpload**, starting from an high-level vision and going into low-level implementation decisions.

It is organised by the following activities:

- [Business modeling](#Business-Modelling)
  - [Product Vision](#Product-Vision)
  - [Features and Assumptions](#Features-and-Assumptions)
- [Requirements](#Requirements)
  - [User stories](#User-stories)
  - [Domain model](#Domain-model)
  - [User interfaces](#User-interfaces)
- [Architecture and Design](#Architecture-And-Design)
  - [Logical architecture](#Logical-Architecture)
  - [Physical architecture](#Physical-Architecture)
  - [Functional prototype](#Functional-Prototype)
- [Project management](#Project-Management)
  - [Sprint 0](#Sprint-0)
  - [Sprint 1](#Sprint-1)
  - [Sprint 2](#Sprint-2)
  - [Sprint 3](#Sprint-3)
  - [Final Release](#Final-Release)

Contributions are expected to be made exclusively by the initial team, but we may open them to the community, after the course, in all areas and topics: requirements, technologies, development, experimentation, testing, etc.

Please contact us!

Thank you!

- David Ferreira (up202404038@up.pt)
- Francisco Mendes (up202407152@up.pt)
- Pedro Teixeira (up202404987@up.pt)
- Rafael Pinho e Silva (up202406334@up.pt)
- Tiago Su (up202403468@up.pt)

---

## Business Modelling

Business modeling in software development involves defining the product's vision, understanding market needs, aligning features with user expectations, and setting the groundwork for strategic planning and execution.

### Product Vision

<!--
Start by defining a clear and concise product vision for your app, to help members of the team, contributors, and users into focusing their often disparate views into a concise, visual, and short textual form.

The vision should provide a "high concept" of the product for marketers, developers, and managers.

A product vision describes the essential of the product and sets the direction to where a product is headed, and what the product will deliver in the future.

**We favor a catchy and concise statement, ideally one sentence.**

We suggest you use the product vision template described in the following link:
* [How To Create A Convincing Product Vision To Guide Your Team, by uxstudioteam.com](https://uxstudioteam.com/ux-blog/product-vision/)

To learn more about how to write a good product vision, please read:
* [Vision, by scrumbook.org](http://scrumbook.org/value-stream/vision.html)
* [Product Management: Product Vision, by ProductPlan](https://www.productplan.com/glossary/product-vision/)
* [20 Inspiring Vision Statement Examples (2019 Updated), by lifehack.org](https://www.lifehack.org/articles/work/20-sample-vision-statement-for-the-new-startup.html)
-->

FeUpload aims to be the platform where students can find, share, rate, and organize notes, exercises, and study materials.
<br/>
Because studying is already hard enough.

### Features and Assumptions

- Access to old exams
  - A page where you can browse through old exams filtering from subject and year
- Access to extra exercises with answers
  - A page where you can browse through extra exercises with answers
- The ability to add new materials
  - A page where you can upload new materials
- The ability to rate materials, and see other ratings
  - Each material will be rateable, you can see materials rating average and comments
- The ability to access summaries and anotations
  - A page where you can browse through summaries and anotations
- The ability to bookmark materials
  - Every material can be bookmarked, bookmarked materials will be accessible through the Projects page.
- Student threads, with advice from senior students
  - Students can create threads with their advice, you can comment on threads
- The ability to see materials offline (previously downloaded)
  - Every material can be marked, next time you open the app with internet you still have access to it
- Toggle between solved and unsolved materials
  - When seeing a material, you can toggle between the solved and unsolved versions quickly
- The ability to share projects from other students
  - A page with projects from senior students
- AI integration
  - Integration of AI to assist you while studying, providing you with summaries, reviewing the topics based on the available material and creation of new materials based on old ones

## Requirements

### User Stories

<!--
In this section you should describe all kinds of requirements for your module: functional and non-functional requirements.

For LEIC-ES-2025-26, the requirements will be gathered and documented as user stories.

Please add in this section a concise summary of all the user stories (not each user story!).

**User stories as GitHub Project Items**
The user stories themselves should be created and described as items in your GitHub Project with the label "user story".

A user story is a description of a desired functionality told from the perspective of the user or customer. A starting template for the description of a user story is *As a < user role >, I want < goal > so that < reason >.*

Name the item with either the full user story or a shorter name (recommended). In the “comments” field, add relevant notes, mockup images, and acceptance test scenarios, linking to the acceptance tests when available, and finally estimate value and effort.

**INVEST in good user stories**.
You may add more details after, but the shorter and complete, the better. In order to decide if the user story is good, please follow the [INVEST guidelines](https://xp123.com/articles/invest-in-good-stories-and-smart-tasks/).

**User interface mockups**.
After the user story text, you should add a draft of the corresponding user interfaces, a simple mockup or draft, if applicable.

**Acceptance tests**.
For each user story you should write also the acceptance tests (textually in [Gherkin](https://cucumber.io/docs/gherkin/reference/)), i.e., a description of scenarios (situations) that will help to confirm that the system satisfies the requirements addressed by the user story.

**Value and effort**.
At the end, it is good to add a rough indication of the value of the user story to the customers (e.g. [MoSCoW](https://en.wikipedia.org/wiki/MoSCoW_method) method) and the team should add an estimation of the effort to implement it using points in a kind-of-a Fibonnacci scale (1,2,3,5,8,13,20,40, no idea).

-->

The platform enables students to browse old exams, exercise sheets, notes, and summaries contributed by peers, while also allowing them to publish their own materials and grow the community. Content is organized by relevance and popularity through a rating and voting system, and users can bookmark and group materials for easy access, as well as filter between solved and unsolved versions. An integrated AI assistant rounds out the experience by generating extra study content and answering difficult questions.

### Domain model

<!--
To better understand the context of the software system, it is useful to have a simple UML class diagram with all and only the key concepts (names, attributes) and relationships involved of the problem domain addressed by your app.
Also provide a short textual description of each concept (domain class).

Example:
 <p align="center" justify="center">
  <img src="https://github.com/FEUP-LEIC-ES-2022-23/templates/blob/main/images/DomainModel.png"/>
</p>
-->
 <p align="center" justify="center">
  <img src="./misc/UMLs/DomainUML.png"/>
</p>

### Validation from our target users

To refine and improve our app, we decided to interview students. For each user story, we asked how important it was and whether they would use an app like this if they had access to it. We also asked if there were any features they would like to have that could help their past and/or current selves.

Ultimately, we decided to incorporate an additional feature that enables users to share and explore projects created by other students, with the aim of fostering inspiration and facilitating the analysis of project capabilities. Furthermore, we observed that one of the main points emphasized by participants was the importance of effectively filtering and organizing materials by course and class.

## Architecture and Design

<!--
The architecture of a software system encompasses the set of key decisions about its organization.

A well written architecture document is brief and reduces the amount of time it takes new programmers to a project to understand the code to feel able to make modifications and enhancements.

To document the architecture requires describing the decomposition of the system in their parts (high-level components) and the key behaviors and collaborations between them.

In this section you should start by briefly describing the components of the project and their interrelations. You should describe how you solved typical problems you may have encountered, pointing to well-known architectural and design patterns, if applicable.
-->

For our application, we require four main components: the frontend, the backend, the database, and an AI service. The frontend, responsible for the user interface, sends requests to the backend. The backend contains the necessary modules and business logic to handle these requests and implement the core functionality of the application.

For data persistence, the system uses a database, while an external AI service provides intelligent features such as content generation and question answering. The backend communicates with both the database and the AI service to retrieve, store, and process information.

### Logical architecture

<!--
The purpose of this subsection is to document the high-level logical structure of the code (Logical View), using a UML diagram with logical packages, without the worry of allocating to components, processes or machines.

It can be beneficial to present the system in a horizontal decomposition, defining layers and implementation concepts, such as the user interface, business logic and concepts.

Example of _UML package diagram_ showing a _logical view_ of the Eletronic Ticketing System (to be accompanied by a short description of each package):

![LogicalView](https://user-images.githubusercontent.com/9655877/160585416-b1278ad7-18d7-463c-b8c6-afa4f7ac7639.png)
-->

 <p align="center" justify="center">
  <img src="./misc/UMLs/logicalUML.png"/>
</p>

### Physical architecture

<!--
The goal of this subsection is to document the high-level physical structure of the software system (machines, connections, software components installed, and their dependencies) using UML deployment diagrams (Deployment View) or component diagrams (Implementation View), separate or integrated, showing the physical structure of the system.

It should describe also the technologies considered and justify the selections made. Examples of technologies relevant for ESOF are, for example, frameworks for mobile applications (such as Flutter).

Example of _UML deployment diagram_ showing a _deployment view_ of the Eletronic Ticketing System (please notice that, instead of software components, one should represent their physical/executable manifestations for deployment, called artifacts in UML; the diagram should be accompanied by a short description of each node and artifact):

![DeploymentView](https://user-images.githubusercontent.com/9655877/160592491-20e85af9-0758-4e1e-a704-0db1be3ee65d.png)
-->
 <p align="center" justify="center">
  <img src="./misc/UMLs/physicalUML.png"/>
</p>

### Functional prototype

<!--
To help on validating all the architectural, design and technological decisions made, we usually implement a functional prototype, a thin vertical slice of the system integrating as much technologies as we can.

In this subsection please describe which feature, or part of it, you have implemented, and how, together with a snapshot of the user interface, if applicable.

At this phase, instead of a complete user story, you can simply implement a small part of a feature that demonstrates thay you can use the technology, for example, show a screen with the app credits (name and authors).
-->

For Prototype 0, we implemented a basic navigation bar that allows users to switch between pages (Home, Exercises, Exams, and Upload). We also developed a simple Home page displaying available classes; selecting a class directs the user to a dedicated page containing all associated materials. Additionally, in the Exercises and Exams pages, we included a hardcoded example of a resource which, when selected, opens an external URL in a web browser. And finally, we implemented a basic and hardcoded forms to upload an exam.

<p align="center" justify="center">
  <img src="./misc/demos/prototype0.gif"/>
</p>

## Project management

<!--
Software project management is the art and science of planning and leading software projects, in which they are planned, implemented, monitored and controlled.

In the context of ESOF, we recommend each team to adopt a set of project management practices and tools capable of registering tasks, assigning tasks to team members, adding estimations to tasks, monitor tasks progress, and therefore being able to track their projects.

Common practices of managing agile software development with Scrum are: backlog management, release management, estimation, Sprint planning, Sprint development, acceptance tests, and Sprint retrospectives.

You can find below information and references related with the project management:

* Backlog management: Product backlog and Sprint backlog in a [Github Projects board](https://github.com/orgs/FEUP-LEIC-ES-2023-24/projects/64);
* Release management: [v0](#), v1, v2, v3, ...;
* Sprint planning and retrospectives:
  * plans: screenshots of Github Projects board at begin and end of each Sprint;
  * retrospectives: meeting notes in a document in the repository, addressing the following questions:
    * Did well: things we did well and should continue;
    * Do differently: things we should do differently and how;
    * Puzzles: things we don’t know yet if they are right or wrong;
    * list of a few improvements to implement next Sprint;

-->

### Development environment (tools and infrastructure)

| Category     | Tool/Service                                  | Purpose                               |
| ------------ | --------------------------------------------- | ------------------------------------- |
| Runtime      | Node.js 20.x + npm                            | Dependency management and scripts     |
| Mobile stack | Expo + React Native + expo-router             | App framework and navigation          |
| Backend      | Supabase (Postgres + Auth + Storage)          | Data, authentication, and files       |
| Testing      | Jest + React Native Testing Library + Maestro | Unit/component and acceptance testing |
| CI/CD        | GitHub Actions                                | Automated lint/test checks on PRs     |
| IDE/SDK      | VS Code, Android Studio (or Xcode on macOS)   | Development and emulator/simulator    |

### Setup

1. Clone repository:

```sh
git clone git@github.com:LEIC-ES-2025-26-2LEIC13/T2.git
cd T2
```

2. Install dependencies:

```sh
npm install
```

3. Configure Supabase environment:

- Create `.env` at the project root with:

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

- Run migrations described in `SUPABASE_SETUP.md`.

4. Run the app:

```sh
npm start
```

- Press `a` for Android emulator, `w` for web, or scan QR with Expo Go.

### AI usage and prompt documentation

The project uses GenAI assistants (ChatGPT, Claude, Gemini) for ideation, code generation, debugging, and test authoring support.

#### How AI is used

- Generate implementation drafts for UI components and service functions.
- Suggest test cases (unit and acceptance tests) and help mock dependencies.
- Debug runtime/build/test errors by analyzing logs and proposing fixes.
- Refactor repetitive code while preserving existing behavior.

#### Human review policy

- AI suggestions are never merged blindly.
- Every AI-generated change is reviewed, edited, and validated by team members.
- Final responsibility for code quality, architecture, and security is always human.

#### Prompt traceability policy

- Prompts used for relevant changes are documented in PR descriptions/comments.
- The PR must include what was generated by AI and what was manually changed.
- Prompt logs stay with the PR conversation (no separate devlog required).

### Scrum patterns and evidence

This project follows Scrum practices and keeps the evidence in GitHub issues/PRs, GitHub Project board, and repository notes.

#### Definition of Ready (DoR)

A Product Backlog Item is considered ready for Sprint Planning only if:

- It has a clear user value statement and acceptance criteria.
- Dependencies and technical risks are identified.
- Effort is estimated (Pigs Estimate / story points).
- It is small enough to fit in one sprint (no epics in Sprint Backlog).
- It has a clear test/validation strategy.

#### Sprint Planning and Sprint Backlog

- Sprint Backlog items are moved from the Product Backlog during Sprint Planning.
- Planning uses:
  - **Yesterday’s Weather** (previous sprint velocity as planning baseline),
  - **Pigs Estimate** (team effort estimates in points),
  - **Small Items** rule (split large stories before adding to Sprint Backlog).
- Sprint Backlog is capped by realistic team capacity and excludes epics.

#### Work assignment and WiP policy

- Sprint Backlog items are assigned only when work starts (pair/trio/team), never pre-assigned at planning time.
- Work in progress is kept low:
  - max 1 active item per pair/trio,
  - avoid paused items,
  - finish in-progress work before pulling new work.

#### Sprint Review

- At sprint end, the increment is demonstrated to all stakeholders (teacher included).
- Feedback is recorded and translated into Product Backlog updates.
- Evidence: `misc/scrum/sprint-review.md`.

#### Sprint Retrospective

- A retrospective is held at the end of each sprint and documented.
- Each retrospective includes:
  - what worked,
  - what did not work,
  - improvement suggestions,
  - verifiable action points (owner + measurable outcome).
- Evidence: `misc/scrum/sprint-retrospective.md`.

#### Agile board and release traceability

- Product Backlog / Sprint Backlog: GitHub Projects board (team board).
- Releases and increment summary: GitHub Releases + `CHANGELOG.md`.
- Planning rules and DoR: `misc/scrum/sprint-planning.md`.
- Sprint Review notes: `misc/scrum/sprint-review.md`.
- Sprint Retrospective notes: `misc/scrum/sprint-retrospective.md`.

### Sprint 0

<p align="center" justify="center">
  <img src="./misc/sprints/sprint0.png"/>
</p>

### What Went Well?

- Team aligned on product vision and initial scope.
- Base navigation and initial prototype delivered.

### What Didn’t Go So Well?

- Too much time spent debating feature scope.
- Some backlog items were too broad at start.

### What Still Puzzles Me?

- How detailed should be the user stories?
- Which feature is doable to do?

### Improvement strategy (verifiable)

| Action                                                  | Owner                 | Verification                                           |
| ------------------------------------------------------- | --------------------- | ------------------------------------------------------ |
| Split large backlog items before Sprint Planning        | Whole team            | Sprint Backlog contains no epic-sized items            |
| Add DoR checklist before moving items to Sprint Backlog | Scrum lead for sprint | Every selected item has acceptance criteria + estimate |
| Limit parallel work to reduce pauses                    | Whole team            | At most one active item per pair/trio                  |

### Happiness Meter

<p align="center" justify="center">
  <img src="./misc/sprints/sprint1-happiness.png"/>
</p>

### Sprint 1

<h4>Sprint 1 Planning</h4>

<p align="center" justify="center">
  <img src="./misc/sprints/sprint1-planning.png"/>
</p>
<h4>Sprint Retrospective</h4>

- [Sprint retrospective details](https://github.com/LEIC-ES-2025-26-2LEIC13/T2/blob/main/misc/scrum/sprint-retrospective.md#sprint-1-retrospective)
<h4>Sprint review</h4>

- [Sprint Review details](https://github.com/LEIC-ES-2025-26-2LEIC13/T2/blob/main/misc/scrum/sprint-review.md#sprint-1-review)
<h4>Happiness Meters</h4>
<p align="center" justify="center">
  <img src="./misc/sprints/sprint1-happiness.png"/>
</p>

<h4>Tests can be found in this directories:</h4>

- [Acceptance tests directory](https://github.com/LEIC-ES-2025-26-2LEIC13/T2/tree/main/.maestro)
- [Unit tests directory](https://github.com/LEIC-ES-2025-26-2LEIC13/T2/tree/main/tests)

### Sprint 2

<h4>Sprint 1 Planning</h4>

<p align="center" justify="center">
  <img src="./misc/sprints/sprint2-planning.png"/>
</p>
<h4>Sprint Retrospective</h4>

### Sprint 3

### Sprint 4

### Final Release

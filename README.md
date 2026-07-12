# FeUpload

FeUpload is a mobile app for sharing study materials among students, built with Expo/React Native.

> This project was developed by David Ferreira (up202404038), Francisco Mendes (up202407152), Pedro Tomás Teixeira (up202404987), Rafael Pinho e Silva (up202406334), and Tiago Su (up202403468) for LEIC-ES 2025/26.

For the full Software Development Report, see [`docs/README.md`](docs/README.md).

![Grade](https://img.shields.io/badge/Grade-20%2F20-1E90FF?style=for-the-badge&labelColor=21262d)
![Course](https://img.shields.io/badge/Course-LEIC--ES-1E90FF?style=for-the-badge&labelColor=21262d)
![Semester](https://img.shields.io/badge/Semester-2025%2F26-1E90FF?style=for-the-badge&labelColor=21262d)

## Features

Users can browse and upload old exams and extra exercises (with answers), access summaries and annotations, rate and bookmark materials, and toggle between solved and unsolved versions of a resource. Materials can be saved for offline access, and student threads let senior students share advice with the community. An AI assistant rounds out the experience with generated flashcards and a PDF Q&A chat for studying directly from uploaded materials.

## Requirements

The platform enables students to browse old exams, exercise sheets, notes, and summaries contributed by peers, while also allowing them to publish their own materials and grow the community. Content is organized by relevance and popularity through a rating and voting system, and users can bookmark and group materials for easy access, as well as filter between solved and unsolved versions. An integrated AI assistant rounds out the experience by generating extra study content and answering difficult questions.

Requirements were validated through interviews with target users, which led to adding a feature for sharing and exploring projects from other students, and reinforced the importance of filtering and organizing materials by course and class.

## Architecture

The application is built around four main components: the frontend, the backend, the database, and an AI service. The frontend sends requests to the backend, which contains the business logic and core functionality; the backend persists data in the database and calls out to the external AI service for content generation and question answering.

## Project Management

Development ran across four sprints. Sprint 3 added AI-powered study flashcards, a PDF Q&A chat interface, an improved document/course UI, and expanded test coverage (unit and Maestro integration tests) for the new AI features. Each sprint followed a Scrum workflow with sprint planning, reviews, and retrospectives, tracked via a GitHub Project board.

## Validation

After development, the team interviewed members of the app's target audience to evaluate usability, functionality, and overall effectiveness. Access to past exams and exercises — the app's core feature — received 100% positive feedback; file upload, the solved/unsolved toggle, and offline access each scored 87.5% positive. The most valued feature overall was the solved/unsolved toggle, since it's one of the app's most distinctive advantages over existing (mostly web-based) alternatives. Overall ratings and likelihood-to-use were highly positive, confirming the app addresses a real, common problem for students better than the alternatives available.

## Final Product

The team considers the app to have reached a stable, polished version suitable for release: a visually appealing interface, strong test coverage, and a modular, easy-to-understand codebase.

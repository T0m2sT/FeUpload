# Sprint Conventions

## Milestone Naming

Milestones must be named exactly `Sprint N` (e.g., `Sprint 1`, `Sprint 2`).

- Always set a **due date** on the milestone before the sprint starts.
- The sprint automation workflow (`sprint.yml`) identifies the current sprint by finding the open `Sprint N` milestone with the earliest due date.
- Create milestones at: **GitHub → Issues → Milestones → New milestone**

## Label Set

Apply these labels to issues. Create them once via GitHub → Issues → Labels:

| Label | Colour | Meaning |
|---|---|---|
| `backlog` | `#C5DEF5` | Not yet in a sprint |
| `in-progress` | `#0075CA` | Being worked on |
| `done` | `#0E8A16` | Completed and merged |
| `carried-over` | `#FFA500` | Moved from a previous sprint (auto-applied) |
| `bug` | `#D73A4A` | Something is broken |
| `enhancement` | `#A2EEEF` | New feature or improvement |

## Tag Convention

| Pattern | Example | Effect |
|---|---|---|
| `sprint-N` | `sprint-2` | Triggers EAS build + pre-release |
| `vX.Y.Z` | `v1.0.0` | Triggers EAS build + full release |

To tag a sprint release:
```bash
git tag sprint-2
git push origin sprint-2
```

## EXPO_TOKEN Setup (one-time)

1. Go to [expo.dev](https://expo.dev) and sign in.
2. Click your profile → **Account Settings** → **Access Tokens**.
3. Click **Create Token**, give it a name (e.g., `github-ci`), copy the value.
4. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**.
5. Click **New repository secret**.
   - Name: `EXPO_TOKEN`
   - Value: paste the token
6. Click **Add secret**.

The `release.yml` workflow will now authenticate automatically on tag pushes.

## Sprint Automation

The `sprint.yml` workflow runs automatically every **Monday at 09:00 UTC**.

To close a sprint manually:
1. Go to **GitHub → Actions → Sprint Automation**.
2. Click **Run workflow**.
3. Enter the sprint number to close.
4. Click **Run workflow**.

The workflow will:
- Move all open issues to `Sprint N+1` (creating it if needed)
- Label moved issues as `carried-over`
- Close the `Sprint N` milestone
- Open a retrospective summary issue

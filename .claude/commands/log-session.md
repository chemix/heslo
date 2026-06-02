---
description: Wrap up the current session by committing the work with a properly-shaped message (terse subject + why/what/how-it-works-now body). Follows the `git-activity` skill.
---

# /log-session

End-of-session commit flow. The session's substantive changes become one (or more) git commits whose bodies carry the why/what/how-it-works-now of the work — git history *is* the activity log.

## When to run

- After substantive work, before signing off.
- Working tree has uncommitted changes that represent a coherent session.
- The user agreed to commit (either explicitly invoked `/log-session`, or said yes when you proactively suggested it).

Do NOT run mid-session, on a dirty tree where some changes are exploratory and not yet ready, or when the user hasn't confirmed.

## What the command does

1. **Survey the work** — `git status` and `git diff` (and `git diff --staged` if anything is already staged). Read the diff well enough to write an honest "Why / What / How it works now" body.
2. **Decide the commit boundary.** One concern per commit. If the session touched two unrelated things (e.g. a design-system rework AND an auth fix), propose splitting into two commits and let the user pick the order. Don't merge for tidiness.
3. **Draft the message** following the format defined in `.claude/skills/git-activity/SKILL.md`:
   - Subject ≤ 60 chars, imperative, no period.
   - Body sections: `Why`, `What`, `How it works now`, optional `Deploy notes`, optional `Follow-ups`.
   - Reference related commits by short SHA + subject; memories by `[[slug]]`.
4. **Show the user the draft** (subject + body) and the file list to be staged. Wait for confirmation. Do not stage or commit before they say go.
5. **Stage explicitly** — list files by path; never `git add -A` / `git add .` (avoids accidentally staging `.env`, build artifacts, scratch files).
6. **Commit via HEREDOC** so the multi-line body keeps its formatting. Do NOT add `Co-Authored-By: Claude` unless the user asks for it.
7. **Verify** — `git status` (should show clean tree or only the deliberately-deferred files) and `git log -1 --stat` so the user sees what landed.

## Pre-commit checks

Before staging, confirm:

- No secrets (`.env`, credentials, tokens) in the diff.
- No large binaries unless deliberate.
- If runtime code changed, the project's test suite passes. If not run yet this session, run it now and surface any failures before committing.
- If only styling or design-system files changed, tests are optional — say so to the user.

## Deploy follow-up

If the commit changes server code or anything a running service would pick up, remind the user that going live may require restarting the relevant service (which can drop active sessions). Do NOT restart automatically — that's a separate, explicit user decision.

## Do not push

`/log-session` commits locally only. Pushing is a separate user action.

## Example flow

```
> /log-session

I've reviewed the diff. The session touched two concerns:
  1. Dropdown surface unification (styling + a UI component)
  2. Auth test for unicode tokens (a test file)

Proposing two commits:

  [1/2] Unify dropdown surface with design-system idiom
        Why: ...
        What: ...
        How it works now: ...
        Files: <styling file>, <UI component>

  [2/2] Cover unicode tokens in auth tests
        Why: ...
        ...

Ready to stage commit 1/2?
```

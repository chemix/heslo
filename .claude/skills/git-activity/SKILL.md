---
name: git-activity
description: Project convention for commit messages on this repo. Use when authoring any commit on this repo — especially `/log-session` wrap-ups. Defines the terse-subject / rich-body format that makes `git log` usable as the session activity log.
---

# git-activity

Git history is this project's activity log. A commit you write today is the only thing a future session (or future you) will have to reconstruct *why* the change happened. Optimize for that reader.

## The shape

```
<subject — imperative, ≤ 60 chars, no period>

Why
  One short paragraph or 2–4 bullets. What problem, constraint,
  user request, or incident drove this? Not "the code needed it"
  — the human-level motivation. If a memory or earlier commit
  prompted it, reference the slug or short SHA.

What
  Concrete changes, grouped thematically (not file-by-file unless
  the file IS the unit). Mention new files with `(new)`. Skip
  anything trivially visible in the diff — focus on intent.

How it works now
  How the system behaves after this commit. One paragraph max.
  This is what someone running `git log` six months from now will
  read to understand current state without opening files.

[optional] Deploy notes
  Only if this commit needs a service restart or something
  operationally non-obvious to go live.

[optional] Follow-ups
  Open threads, deferred work, or known gaps the next session
  should know about. One bullet each, no prose.
```

## Why this shape

- **Terse subject** — `git log --oneline` stays scannable. If the subject can't fit, the commit is probably two commits.
- **Why before what** — diffs already show *what*. Reviewers and future-you need the *why* that the diff cannot recover.
- **How it works now** — replaces the "current architecture" prose we used to dump into `ACTIVITY_LOG.md`. Reading the last N commits should reconstruct the system without opening source.
- **No "Co-Authored-By: Claude" unless requested** — keeps history clean; the user can add it explicitly when they want it.

## Subject line patterns

Prefer plain imperatives. Don't invent conventional-commits prefixes (`feat:`, `fix:`) — this project doesn't use them.

Good:
- `Unify dropdown surface with design-system idiom`
- `Reject placeholder token even when the auth token is set`
- `Add /design-system route and showcase page`

Avoid:
- `Update styles.css` (no intent)
- `Various fixes` (no scope)
- `feat(ui): add button variants per discussion` (jargon, prefix, hedge)

## One commit, one concern

If a session touched the design system *and* fixed an auth bug, that's two commits. The `/log-session` flow will propose splitting; resist the urge to merge them for tidiness.

## Anti-patterns

- **Restating the diff in prose.** "Changed line 42 of foo.ts from X to Y" — no. The diff already says that.
- **Writing the body as a changelog of your session.** "First I tried X, then Y didn't work, finally Z." The reader wants the final state, not the journey.
- **Vague hand-waves.** "Improved styling" / "cleaned up code" — say *what* improved and *why* the old state was wrong.
- **Empty bodies on non-trivial commits.** If the subject alone tells the whole story, fine. If not, write the body.

## Cross-linking

- Reference earlier commits by short SHA + subject: `Builds on a1b2c3d (Add button variants)`.
- Reference memory entries by slug in double brackets: `See [[feedback-dropdown-styling]]`.
- Reference issues or PRs by `#N` when they exist.

## Verifying before committing

Before `git commit`, always:

1. `git status` — make sure nothing unintended is staged.
2. `git diff --staged` — the body of your commit message should be defensible against this diff.
3. No `.env`, secrets, or large binaries staged.
4. The project's test suite passes if the change touches runtime code.

## Pattern for new project skills and commands

When designing new slash commands or skills for this repo, mirror the shape above:

- **One clear job per artifact.** A `/log-session` command logs a session. It does not also lint, deploy, or summarize for Slack. New responsibilities → new commands.
- **Front-load the *why*.** Both skills and commands should open with a one-paragraph motivation so the next session understands when (and when not) to invoke them — same instinct as the commit "Why" section.
- **Czech for user-facing strings, English for skill/command internals.** Matches the existing convention in the project's UI labels.
- **Reference, don't duplicate.** If a command's behavior depends on a skill (like `/log-session` depending on this skill), link to it rather than re-explaining the format. Single source of truth.
- **End-state, not playbook.** Commands should describe the outcome they produce and the checks they make, not a rigid step list — Claude can sequence the work, but it needs to know what "done" looks like.

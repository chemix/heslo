# Password Generator

Static, client-side password generator. No backend, no build step, no storage — `index.html` loads `app.js` and the CSS directly. Generation runs entirely in the browser via `crypto.getRandomValues`; generated values are never logged or persisted. Project specifics (features, file map, smoke tests) live in `README.md`.

- **Live:** https://chemix.github.io/heslo/ (GitHub Pages)
- **Source:** https://github.com/chemix/heslo
- **Deploy:** pushing to `main` runs `.github/workflows/pages.yml`, which publishes the repo root to GitHub Pages. No build step. Asset links in `index.html` must stay relative so the page works under the `/heslo/` subpath.

## Files

- `index.html` — static page and UI.
- `app.js` — client-side generator logic (random + memorable modes, bulk 10-password table). All logic lives in one `DOMContentLoaded` closure; nothing is exported.
- `styles.css` — project styles over Kostra tokens.
- `kostra.css` — drop-in Kostra CSS from `/var/www/kostra/.claude/skills/kostra-css/kostra.css`.
- `.github/workflows/pages.yml` — GitHub Pages deploy on push to `main`.

## Local Claude tooling

This repo ships its own skill and slash command under `.claude/`. Use them — don't reinvent the conventions inline, and don't duplicate their contents here.

- **`git-activity` skill** (`.claude/skills/git-activity/SKILL.md`) — commit-message convention. **Git history is this project's activity log.** Read it before authoring any commit.
- **`/log-session` command** (`.claude/commands/log-session.md`) — end-of-session commit flow. Surveys the diff, proposes a commit boundary, drafts a message per `git-activity`, and only stages/commits after explicit confirmation. Local commit only.

## Proactively offering `/log-session`

Recording session work as a git commit *is* logging it. Don't wait to be asked; when the session reaches a natural commit point, offer it.

**Offer when ALL of these hold:**
- Working tree has uncommitted changes from this session (verify with `git status` if unsure).
- Those changes form a coherent, completed unit — a fix has landed, a feature reached a working state, a refactor is done.
- The user signalled the work is good: explicit acceptance ("díky", "perfektní", "ship it"), or a clear pause after verifying behavior.

**Do NOT offer when:**
- Tree is dirty with half-finished or exploratory changes still in flight.
- User is mid-iteration and hasn't confirmed the latest change works.
- You already offered this session and they declined or deferred — don't re-ask.
- Changes are throwaway debug scaffolding the user will revert.

**How to offer.** One short Czech sentence (user-facing strings are Czech in this repo). Example: *"Hotovo. Chceš to zaevidovat přes `/log-session`?"* Don't pre-draft the commit message or list files — the command does the full survey itself once invoked. If the user says yes, run `/log-session`. If no, drop it.

## Other conventions

- **Czech for user-facing strings, English for internals** (matches `styles.css` labels and this file).
- **Smoke-test before committing runtime changes.** `node --check app.js` catches syntax breakage; for behavior, open the page in a browser (logic lives in the DOM closure and is not exported, so there is no no-DOM run).

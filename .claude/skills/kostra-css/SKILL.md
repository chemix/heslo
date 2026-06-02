---
name: kostra-css
description: Minimalistický CSS design system nad nativními HTML prvky. Use when the user asks to build a UI, prototype a page, or style HTML/Preact/React/Vue/Svelte markup in a project where kostra has been adopted. Triggers include "udělej tlačítko", "stylize this form", "drop-in design system", "use kostra", or any frontend task on a project where this skill is installed. The skill ships a single drop-in `kostra.css` plus working examples; class name is the whole API.
---

# kostra-css

Kostra is a one-file CSS design system. Drop `kostra.css` into a project, write classes in the markup, and you have shadcn-shaped buttons, inputs, dropdowns, status indicators and badges without a build step, framework, or runtime dependency.

This skill is the **portable** form of kostra — when installed in another project, it brings the canonical `kostra.css` alongside this documentation. The contract is the same as in the source repo at `/var/www/kostra`: the class name is the entire API.

## When to use

- The user is building UI in a project that has adopted kostra (look for `kostra.css` linked anywhere, or `--accent`/`--panel`/`--radius-sm` tokens in stylesheets).
- The user asks for a quick design system or styled HTML without bringing in Tailwind / shadcn / a component library.
- The user explicitly references kostra ("použij kostru", "drop-in kostra.css").

If the project already has Tailwind, shadcn, MUI, Chakra or similar **and** the user has not asked for kostra, prefer the existing system. Kostra is for projects that deliberately picked a single-file CSS approach.

## Install in a consumer project

1. Copy `kostra.css` from this skill (`.claude/skills/kostra-css/kostra.css`) into the project's static assets — typical destinations:
   - `public/kostra.css` for Bun, Vite, Next.js, Astro, plain static sites.
   - `static/kostra.css` for SvelteKit.
   - `assets/kostra.css` for Rails / Phoenix-style apps.
2. Link it once from the page `<head>`:
   ```html
   <link rel="stylesheet" href="/kostra.css">
   ```
3. Write classes directly in markup. No imports, no JS, no `clsx`/`cva`.

For Preact/React, use `class=` if the project's JSX is configured for Preact (the markup stays portable), otherwise `className=`.

## Class catalog

Every class works the same way: a **base** class plus optional **modifiers** prefixed with `--`. Sizes (`--sm`, `--lg`) and variants (`--default`, `--outline`, `--ghost`, …) compose freely.

### `.btn` — button (shadcn-shaped)

Variants: `--default`, `--secondary`, `--destructive`, `--outline`, `--ghost`, `--link`.
Sizes: `--sm`, `--lg`. Icon-only: `--icon` (combine with a size for square buttons).

```html
<button class="btn btn--default">Connect</button>
<button class="btn btn--outline btn--sm">Refresh</button>
<button class="btn btn--destructive">Delete</button>
<button class="btn btn--ghost btn--icon" aria-label="More"><svg>…</svg></button>
```

A bare `<svg>` inside `.btn` is sized to 1rem automatically.

### `.btn-group` — adjacent buttons share an edge

```html
<div class="btn-group" role="group">
  <button class="btn btn--outline">Day</button>
  <button class="btn btn--outline">Week</button>
  <button class="btn btn--outline">Month</button>
</div>
```

Add `btn-group--vertical` for stacked groups. Use `<span class="btn-group__separator">` between ghost buttons to draw a toolbar divider.

### `.input` — text field

Sizes: `--sm`, `--lg`. Disabled via the native `disabled` attribute.

```html
<input class="input input--lg" placeholder="Token">
<input class="input" disabled>
```

### `.card` — content container

```html
<div class="card">
  <h3>Connect terminal</h3>
  <p>Token lives in <code>.env</code>.</p>
  <input class="input input--lg" type="password">
  <button class="btn btn--default">Connect</button>
</div>
```

The card adds vertical rhythm between its direct children automatically; do not wrap them in extra `<div>`s.

### `.menu` — dropdown over `<details>`

```html
<details class="menu">
  <summary>Možnosti ⋮</summary>
  <div class="menu__popup" role="menu">
    <button class="btn btn--ghost" role="menuitem">Reconnect</button>
    <button class="btn btn--ghost" role="menuitem">Settings</button>
  </div>
</details>
```

No JS. `<details>` handles open/close. `.btn` inside `.menu__popup` is auto-restyled to look like a menu item.

### `.status` + `.dot` — connection indicator

```html
<span class="status">
  <span class="dot dot--connected"></span> Connected
</span>
```

Dot modifiers: `--connecting` (pulses), `--connected` / `--ok`, `--idle` / `--disconnected`, `--error` / `--danger`.

### `.badge` — pill chip

Variants: `--accent`, `--success`, `--danger` (default is muted).

```html
<span class="badge badge--success">Stable</span>
```

### `.kbd` — keycap

```html
<kbd class="kbd">Ctrl</kbd> + <kbd class="kbd">K</kbd>
```

## Tokens (CSS custom properties)

When you need to extend kostra (a custom component, an inline style), reach for tokens — never hardcode colors or radii.

| Group     | Tokens |
|-----------|--------|
| Surfaces  | `--bg`, `--panel`, `--panel-2`, `--panel-soft`, `--surface-translucent` |
| Lines     | `--line`, `--line-soft`, `--line-strong` |
| Text      | `--text`, `--muted`, `--on-accent`, `--on-danger` |
| Accent    | `--accent`, `--accent-soft`, `--accent-strong` |
| Semantic  | `--danger`, `--danger-strong`, `--success`, `--warning` |
| Type      | `--font-sans`, `--font-mono` |
| Radii     | `--radius-xs` (4), `--radius-sm` (6), `--radius-md` (8), `--radius-lg` (14), `--radius-pill` |
| Shadows   | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| Motion    | `--transition-base`, `--transition-with-shadow` |
| Focus     | `--ring-accent`, `--ring-danger` |

Dark mode is automatic via `@media (prefers-color-scheme: dark)` — every token re-resolves, you do not write dark variants yourself.

## Working examples

`examples/` ships ready-to-paste snippets that mirror what the canonical showcase renders:

- `button.html` — variants, sizes, icons, button-group, toolbar.
- `input.html` — sizes, disabled, full-width field in a card.
- `card.html` — connect-terminal pattern.
- `menu.html` — dropdown anchored bottom-right.
- `status.html` — connecting / connected / error states.

When the user asks for a styled component, look here before improvising.

## Anti-patterns

- **Don't** wrap classes in a React/Preact component "for type safety". Kostra is CSS-first; the class is the API. A `<Button variant="default">` shim leaks the design system into TypeScript and breaks the drop-in promise.
- **Don't** add `cva`, `clsx`, `tailwind-merge` or any class-builder. Strings only.
- **Don't** rename or shadow the tokens (`--brand-color` over `--accent`). The point of shadcn-aligned naming is migration without markup changes — keep that escape hatch.
- **Don't** mix kostra with a competing system on the same page. Pick one.
- **Don't** edit `kostra.css` in place for project-specific tweaks. Override tokens in your own stylesheet:
  ```css
  :root { --accent: oklch(0.6 0.2 250); }
  ```
- **Don't** introduce JS for primitives kostra already covers natively (dropdown via `<details>`, disabled via `disabled` attribute).

## When kostra is the wrong tool

- The project needs **dynamic theming per user**, not just light/dark. Reach for CSS variables wired to a state store, or a real component library.
- The project ships **dozens of bespoke components** (data grids, rich editors, charts). Kostra handles primitives; complex widgets need their own thing.
- The team uses **utility-first CSS** (Tailwind). Don't bolt kostra on top — pick one.

## Updating the bundled CSS

If you are working inside the kostra source repo (`/var/www/kostra`), the source of truth is `src/client/styles.css`. After editing it, run:

```bash
bun run build:css
```

That copies the file to both `public/kostra.css` (distributable) and `.claude/skills/kostra-css/kostra.css` (this skill's bundled copy). The skeleton test guards the sync — if they drift, `bun test` fails.

If you installed this skill in another project, `kostra.css` here is read-only from your perspective: copy it into your project's assets, do not edit it in `.claude/skills/`.

# Roadmap

This document tracks the architectural direction of TaskListify: what has been
cleaned up, what is intentionally still a prototype, and what I'd tackle next.
It exists partly to be honest about the current state of the code and partly to
show the plan for improving it.

## Recently done

- **Repo hygiene** — removed committed secrets from tracking, fixed two
  corrupted `.gitignore` files, deleted dead files (`server.js`, an empty
  `models/` directory, ~740 lines of commented-out code in `TaskList.js`), and
  dropped 9 unused dependencies (Twilio, SendGrid, Express, etc.).
- **Extracted a pure logic layer** (`src/utils/schedule.js`) — priority
  weighting, time-string formatting, integer clamping, day ordering and event
  keys now live in one framework-free module, removing logic that was duplicated
  between `TaskListifyPage` and `SharePage`.
- **Added a test suite** — 16 unit tests covering the scheduling helpers and the
  `TaskListify` model (the project previously had zero tests).
- **`useLocalStorage` hook** (`src/hooks/useLocalStorage.js`) — replaced six
  manual load/save `useEffect` pairs in `TaskListifyPage` with a single reusable
  persistence hook.
- **Shared style helper** (`src/styles.js`) — started consolidating repeated
  inline button styles behind a `button()` helper.

## Next up (highest value first)

1. **Decompose `TaskListifyPage`.** It's still a large component that owns most
   of the app's state. Split it into focused components:
   - `TaskForm` — the add/edit task form and its local field state.
   - `Toolbar` / `SettingsPanel` — mode toggles, theme/font pickers, day config.
   - `WeekGrid` — wraps the existing `TaskList` rendering.
   - `printSchedule` — move the print-to-PDF DOM logic into its own module.
2. **Consolidate state with `useReducer`.** Many of the remaining `useState`
   values are related (edit mode, edited tasks, undo/redo stacks). Group them
   into reducers so transitions are explicit and testable.
3. **Migrate the remaining persisted state** (tasks, hidden days, custom day
   names/order, completed occurrences) onto `useLocalStorage`, with a small
   serializer option for the `Set`-based state.
4. **Finish the style extraction** — move the rest of the inline styles into
   `styles.js` or CSS modules so theming lives in one place.
5. **Broaden test coverage** — add component tests (React Testing Library is
   already installed) for task creation, removal, and the edit-mode flows.

## Known limitations (intentional for this course project)

- **Authentication is demo-only.** Credentials are stored in `localStorage` in
  plaintext; this is not secure and should not use real passwords.
- **The Share page is a UI prototype.** It does not send email/SMS — the
  Twilio/SendGrid integration was never completed and its server code was
  removed.
- **No backend.** All state is per-device in the browser.

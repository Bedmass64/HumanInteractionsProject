# TaskListify

A weekly task-scheduling web app built with React. Users build a recurring
weekly schedule by adding tasks, assigning them to specific days, setting how
many times per day each task occurs (with optional times and notes), and then
viewing, reordering, editing, and printing the resulting week-at-a-glance list.

This project was built as a Human–Computer Interaction course project, with an
emphasis on a flexible, customizable scheduling UI.

## Features

- **Flexible task creation** — name a task, choose how many times per day it
  occurs, set it for every day or specific days, and attach a time and note to
  each occurrence.
- **Two layouts** — view the week as columns or rows.
- **Editing & removal modes** — edit a single occurrence or apply changes to all
  occurrences of a task; remove individual occurrences or whole tasks.
- **Drag-and-drop reordering** within each day.
- **Priority** — tag occurrences High/Medium/Low and sort by priority.
- **Undo / redo** for task changes.
- **Search / filter** across tasks.
- **Customization** — 12 color themes, multiple font choices, custom day labels
  (e.g. rename "Monday" to "Chest"), reorder or hide days of the week, and
  choose which day the week starts on.
- **Print to PDF** — generate a clean, paginated printable version of the
  schedule.
- **Import / export** — download the task list as JSON and upload or merge it
  back in.
- **Local persistence** — all data is saved to the browser's `localStorage`.

## Tech stack

- React 18 (Create React App)
- React Router 6 for navigation
- Browser `localStorage` for persistence (no backend)

## Getting started

```bash
npm install
npm start
```

Then open <http://localhost:3000>.

| Script          | Description                         |
| --------------- | ----------------------------------- |
| `npm start`     | Run the app in development mode      |
| `npm run build` | Build an optimized production bundle |
| `npm test`      | Run the test runner                  |

## Project structure

```
src/
  App.js              Routes (Welcome, Tasks, Login, Create Account, Share)
  index.js            React entry point
  TaskListifyPage.js  Main scheduling screen (task form, toolbar, day grid)
  TaskList.js         Renders the week grid; editing/removal/drag interactions
  TaskListify.js      Helper for organizing tasks by day of week
  Task.js             Simple task model
  WelcomePage.js      Landing page
  LoginPage.js        Demo login (see note below)
  CreateAccount.js    Demo account creation (see note below)
  SharePage.js        Share-list UI (prototype, see note below)
```

## Notes & limitations

This is a frontend-only course project, and a few areas are intentionally
prototypes rather than production features:

- **Authentication is for demonstration only.** Accounts and "login" are stored
  in `localStorage` in plaintext and are not secure. Do not reuse a real
  password here.
- **The Share page is a UI prototype.** It does not actually send email/SMS; the
  original Twilio/SendGrid integration was never completed.
- **No backend.** All state lives in the browser, so data is per-device and
  cleared if local storage is cleared.

## Known areas for improvement

`TaskListifyPage.js` is a large single component that owns most application
state. The pure scheduling logic has been extracted into `src/utils/schedule.js`
(with tests) and `localStorage` access into a `useLocalStorage` hook; the next
step is decomposing the component itself into smaller pieces and consolidating
related state with a reducer. See [ROADMAP.md](./ROADMAP.md) for the full plan.

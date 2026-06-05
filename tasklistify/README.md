# TaskListify

TaskListify is a weekly task scheduler I built with React. The idea's pretty simple: you add tasks, assign them to the days you want, say how many times a day each one should happen (you can tack a time and a note onto each one too), and you get a clean week-at-a-glance view you can reorder, edit, and print.

It started as a project for my Human-Computer Interaction class, so most of the effort went into making the scheduling UI flexible and easy to customize rather than building out a backend.

## Features

- **Flexible task creation**: name a task, pick how many times a day it happens, set it for every day or just specific ones, and add a time and note to each occurrence.
- **Two layouts**: view the week as columns or as rows, whichever you like.
- **Edit and remove modes**: change a single occurrence or apply the change to every occurrence of a task. Same deal for deleting.
- **Drag and drop**: reorder tasks within a day by dragging them around.
- **Priority**: tag occurrences High/Medium/Low and sort by it.
- **Undo / redo** for when you mess something up.
- **Search and filter** to find tasks fast.
- **Customization**: 12 colour themes, a handful of font choices, custom day labels (rename "Monday" to "Chest" if that's your thing), reorder or hide days, and choose which day the week starts on.
- **Print to PDF**: generates a clean, paginated version you can print or save.
- **Import / export**: download the whole list as JSON and load or merge it back in later.
- **Saves locally**: everything lives in the browser's localStorage, so it's still there when you come back.

## Tech stack

Nothing exotic here, it's a frontend-only React app:

- **React 18.3**, scaffolded with Create React App (react-scripts 5)
- **React Router 6** (react-router-dom 6.27): handles moving between the welcome, tasks, login, create-account, and share pages
- **Plain CSS**: one stylesheet per component, no UI framework
- **localStorage** for all persistence, wrapped in a small `useLocalStorage` hook so I'm not repeating load/save effects everywhere
- **Native HTML5 drag and drop**: no drag-and-drop library, just the browser's own drag events for reordering
- **window.print()** for the PDF export: it leans on the browser's built-in print-to-PDF instead of pulling in a heavy PDF library
- **Jest + React Testing Library** (@testing-library/react, jest-dom, user-event) for the tests
- **web-vitals** for the default CRA performance reporting

No server and no database: the whole thing runs in the browser.

## Getting started

```bash
npm install
npm start
```

Then open http://localhost:3000.

| Script          | What it does                          |
| --------------- | ------------------------------------- |
| `npm start`     | Runs the app in development mode       |
| `npm run build` | Builds an optimized production bundle  |
| `npm test`      | Runs the test runner                   |

## Project structure

```
src/
  App.js              Routes (Welcome, Tasks, Login, Create Account, Share)
  index.js            React entry point
  TaskListifyPage.js  Main scheduling screen (task form, toolbar, day grid)
  TaskList.js         Renders the week grid plus editing/removal/drag stuff
  TaskListify.js      Helper for organizing tasks by day of week
  Task.js             Simple task model
  WelcomePage.js      Landing page
  LoginPage.js        Demo login (see the notes below)
  CreateAccount.js    Demo account creation (see the notes below)
  SharePage.js        Share-list UI (prototype, see the notes below)
```

## A few things to know

This is a frontend-only class project, so a couple of parts are prototypes rather than finished features:

- **The login isn't real security.** Accounts and "login" are just stored in localStorage in plaintext. Don't reuse a real password here.
- **The Share page is just the UI.** It doesn't actually send anything: the Twilio/SendGrid email/SMS integration never got finished.
- **There's no backend.** All your data lives in the browser, so it's per-device and it's gone if you clear local storage.

## Stuff I'd still like to fix

`TaskListifyPage.js` got pretty big and ends up holding most of the app's state. I've already pulled the scheduling logic out into `src/utils/schedule.js` (with tests) and moved localStorage access into the `useLocalStorage` hook. The next thing is breaking that big component into smaller pieces and pulling the related state together with a reducer. The full list is in [ROADMAP.md](./ROADMAP.md).

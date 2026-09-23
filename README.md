# TaskFlow Automation — Setup & Run Guide

Automates your manual TaskFlow findings (TC-01 through TC-13).

## Setup (same as last time — reuse your existing Chrome, skip the download)

```
npm install
npx playwright test
```

No `npx playwright install` needed — `playwright.config.js` is already set to use your system's installed Chrome (`channel: 'chrome'`), same fix as the registration app project.

## What to expect

Several tests assert the **correct/spec behavior**, not the app's current (buggy) behavior. On the first run, expect to see roughly **6 tests fail**:
- TC-03 (whitespace title)
- TC-04 (past due date)
- TC-05 (weak email domain)
- TC-06 (unlimited title length)
- TC-08 (XSS in title)
- TC-09 (wrong task deleted when filtered)
- TC-11 (case-sensitive filter)

That's expected — these are your confirmed bugs, now codified as a permanent regression suite. Fix each one in `taskflow-app.html`, re-run `npx playwright test`, and watch each test flip to green as you go.

## Report

```
npm run test:report
```

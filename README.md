# Toolshop Playwright

Automated UI test suite for [practicesoftwaretesting.com](https://practicesoftwaretesting.com/) ("Toolshop"), an open-source e-commerce practice site purpose-built for testers. Written in TypeScript with [Playwright](https://playwright.dev/), following the Page Object Model.

This project applies black-box testing techniques (boundary value analysis, equivalence partitioning, decision tables, error guessing) feature-by-feature, using the site's own built-in **Testing Guide** (18 features, each with acceptance criteria and testing guidance) as the starting map — cross-checked against the open-source project's own [Gherkin acceptance-criteria docs](https://github.com/testsmith-io/practice-software-testing) where the two disagree, and against live, manually-verified app behavior where _both_ disagree with reality. That last step is where the bugs below were found.

## Project Setup

**Prerequisites:** Node.js, npm.

```bash
npm install
npx playwright install   # downloads the Chromium/Firefox/WebKit browser binaries
```

**Running tests:**

```bash
npx playwright test                          # run the full suite, all browsers
npx playwright test tests/register.spec.ts    # run a single spec file
npx playwright test -g "age 17"               # run tests matching a title
npx playwright show-report                    # open the HTML report from the last run
```

**Config highlights** ([playwright.config.ts](playwright.config.ts)):

- `baseURL` set to `https://practicesoftwaretesting.com/` — tests navigate with relative paths (e.g. `page.goto('/auth/register')`)
- Runs against 3 browser projects: Chromium, Firefox, WebKit
- `fullyParallel: true`, HTML reporter, trace captured on first retry

**Structure:**

- `pages/` — Page Object Models (one class per page, e.g. `RegisterPage.ts`)
- `tests/` — spec files, one per feature/module (e.g. `register.spec.ts`)

Since this suite runs against the real public site rather than a local instance, occasional latency-driven flakiness under concurrent multi-browser load is expected infrastructure noise, not a code bug — scoped `{ timeout: ... }` overrides are used where the default times out under load.

**Code formatting** ([Prettier](https://prettier.io/), config in [.prettierrc.json](.prettierrc.json)):

```bash
npm run format          # format all files in place
npm run format:check    # check formatting without writing (useful in CI)
```

In VS Code, `Shift+Option+F` (Mac) / `Shift+Alt+F` (Windows/Linux) formats the current file using Prettier once it's installed as your default formatter for the workspace.

### Git Setup

This repo isn't git-initialized by default — set it up locally with:

```bash
git init
git add .
git commit -m "Initial commit"
```

**Optional — use a different author for this repo specifically** (overrides your global git identity, but only for this project):

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

Local config always takes precedence over global. Run `git config user.name` / `git config user.email` (no `--global`) inside the repo to confirm which identity is actually in effect.

`.gitignore` already excludes `node_modules/`, `test-results/`, `playwright-report/`, `blob-report/`, and Playwright's cache/auth directories, so `git add .` won't pick up generated artifacts. To connect it to a remote once a GitHub repo exists:

```bash
git remote add origin <your-repo-url>
git branch -M main
git push -u origin main
```

## Scenarios Covered per Module

The Testing Guide breaks the site into 18 features. Each is planned as its own spec file, worked one feature at a time. Full scenario tables (and any issues found) live in [`docs/scenarios/`](docs/scenarios/), one file per module, linked below once that module has a plan.

| #   | Module                                                     | Status                                        |
| --- | ---------------------------------------------------------- | --------------------------------------------- |
| 1   | [Register](docs/scenarios/register.md)                     | 🟢 Done — 32 of 32 scenarios done             |
| 2   | [Login](docs/scenarios/login.md)                           | 🟢 Done — 14 of 14 scenarios done             |
| 3   | [Forgot Password](docs/scenarios/forgot-password.md)       | 🟢 Done — 5 of 5 scenarios done               |
| 4   | [Customer Profile](docs/scenarios/customer-profile.md)     | 🟢 Done — 29 of 29 scenarios done             |
| 5   | [Customer Favorites](docs/scenarios/customer-favorites.md) | 🟢 Done — 11 of 12 scenarios done (1 skipped) |
| 6   | [Customer Invoices](docs/scenarios/customer-invoices.md)   | 🟡 In progress — 0 of 10 scenarios done       |
| 7   | Customer Messages                                          | ⚪ Not started                                |
| 8   | Locked Account                                             | ⚪ Not started                                |
| 9   | Multi-Factor Authentication (MFA)                          | ⚪ Not started                                |
| 10  | Contact Form                                               | ⚪ Not started                                |
| 11  | Product Listing                                            | ⚪ Not started                                |
| 12  | Category Page                                              | ⚪ Not started                                |
| 13  | Product Detail Page                                        | ⚪ Not started                                |
| 14  | Shopping Cart                                              | ⚪ Not started                                |
| 15  | Checkout + Payment                                         | ⚪ Not started                                |
| 16  | Geolocation Discount                                       | ⚪ Not started                                |
| 17  | Combined Product Discount                                  | ⚪ Not started                                |

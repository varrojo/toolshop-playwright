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

The Testing Guide breaks the site into 18 features. Each is planned as its own spec file, worked one feature at a time.

| #  | Module                            | Status                                  |
| -- | --------------------------------- | --------------------------------------- |
| 1  | Register                          | 🟡 In progress — 13 of 22 scenarios done |
| 2  | Login                             | ⚪ Not started                           |
| 3  | Forgot Password                   | ⚪ Not started                           |
| 4  | Customer Profile                  | ⚪ Not started                           |
| 5  | Customer Favorites                | ⚪ Not started                           |
| 6  | Customer Invoices                 | ⚪ Not started                           |
| 7  | Customer Messages                 | ⚪ Not started                           |
| 8  | Locked Account                    | ⚪ Not started                           |
| 9  | Multi-Factor Authentication (MFA) | ⚪ Not started                           |
| 10 | Contact Form                      | ⚪ Not started                           |
| 11 | Product Listing                   | ⚪ Not started                           |
| 12 | Category Page                     | ⚪ Not started                           |
| 13 | Product Detail Page               | ⚪ Not started                           |
| 14 | Shopping Cart                     | ⚪ Not started                           |
| 15 | Checkout + Payment                | ⚪ Not started                           |
| 16 | Geolocation Discount              | ⚪ Not started                           |
| 17 | Combined Product Discount         | ⚪ Not started                           |

### Register — 22-scenario plan

| #  | Scenario                               | Expected result                                                                                                                                                  | Status    |
| -- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1  | dob → age 17                           | "Customer must be 18 years old."                                                                                                                                 | ✅ Done    |
| 2  | dob → age 18 exactly                   | Redirect to `/auth/login` — **see Issue #1**, real behavior requires 18 years + 1 day                                                                            | ✅ Done    |
| 3  | dob → age 75                           | Redirect to `/auth/login`                                                                                                                                        | ✅ Done    |
| 4  | dob → age 93                           | "Customer must be younger than 75 years old." — **see Issue #2**, real ceiling is 92, not the documented 75/76                                                   | ✅ Done    |
| 5  | First name missing                     | "First name is required"                                                                                                                                         | ✅ Done    |
| 6  | Last name missing                      | "Last name is required"                                                                                                                                          | ✅ Done    |
| 7  | Email missing                          | "Email is required"                                                                                                                                              | ✅ Done    |
| 8  | Password missing                       | "Password is required"                                                                                                                                           | ✅ Done    |
| 9  | Password, 7 characters                 | All requirement bullets stay unfulfilled (real-time UI state) — **see Issue #5**, submit error text claims a 6-character minimum but the app actually enforces 8 | ✅ Done    |
| 10 | Password, meets all requirements       | All requirement bullets turn green                                                                                                                               | ✅ Done    |
| 11 | Known-breached password                | "The given password has appeared in a data leak. Please choose a different password."                                                                            | ✅ Done    |
| 12 | First name, 41 characters              | "The first name field must not be greater than 40 characters."                                                                                                   | ✅ Done    |
| 13 | Last name, 21 characters               | "The last name field must not be greater than 20 characters."                                                                                                    | ✅ Done    |
| 14 | Street, 71 characters                  | "The address.street field must not be greater than 70 characters."                                                                                               | ⚪ Planned |
| 15 | City, 41 characters                    | "The address.city field must not be greater than 40 characters."                                                                                                 | ⚪ Planned |
| 16 | State, 41 characters                   | "The address.state field must not be greater than 40 characters."                                                                                                | ⚪ Planned |
| 17 | Postal code, 11 characters             | "The address.postal code field must not be greater than 10 characters."                                                                                          | ⚪ Planned |
| 18 | Phone, 25 characters                   | "The phone field must not be greater than 24 characters."                                                                                                        | ⚪ Planned |
| 19 | Phone contains `+`                     | "Only numbers are allowed."                                                                                                                                      | ⚪ Planned |
| 20 | Email malformed / oversized local-part | "Email format is invalid" — **see Issue #4**, a missing-TLD email (`qatest123@gmail`) does NOT trigger this                                                      | ✅ Done    |
| 21 | Email already registered               | "A customer with this email address already exists." — **see Issue #3**, differs from the AC's documented text                                                   | ✅ Done    |
| 22 | All fields valid                       | Redirect to `/auth/login`                                                                                                                                        | ⚪ Planned |

## Issues Found

Confirmed by direct, live testing against the app (codegen, screenshots, binary-search boundary probing) — not assumed from documentation. Filed here as findings, not as GitHub issues against the third-party site.

### Issue #1 — Age-18 boundary is off by one day

The in-app Testing Guide's AC states _"Age must be between 18 and 75 inclusive."_ In practice, registering with a date of birth that makes the user exactly 18 years old **today** is rejected with the same error as being underage ("Customer must be 18 years old."). A full day must pass after the 18th birthday before registration succeeds.

Verified via binary search on the day offset:

- `age 18, today` → rejected
- `age 18, as of yesterday` → accepted
- `age 18, as of tomorrow` (still 17) → correctly rejected

### Issue #2 — Real max-age ceiling is 92, not 75/76

The AC says the upper bound is 75 (inclusive); the Testing Guide's own testing guidance suggests probing 75/76 as the boundary. The actual enforced ceiling is much higher:

- Age 75 → succeeds
- Ages up to 92 → succeed
- Age 93 → rejected ("Customer must be younger than 75 years old.")

The error message itself still claims a 75-year limit, but the real validation boundary is 92/93 — a significant documentation/implementation mismatch, not just an off-by-one.

### Issue #3 — Duplicate-email error text doesn't match documentation

The AC (both the in-app Testing Guide and the open-source repo's `v5.md`) documents the duplicate-email error as:

> "Email is already in use."

The real error returned by the app is:

> "A customer with this email address already exists."

### Issue #4 — Email format validation accepts a missing TLD

Manually registering with `qatest123@gmail` (no top-level domain, e.g. no `.com`) succeeded — the account was created and the app redirected to `/auth/login`, rather than rejecting it with "Email format is invalid." The format check does not require a TLD after the `@domain` part.

Relevant to scenario #20 (Email malformed) — this specific input isn't a valid test case for that scenario's expected "Email format is invalid" error, since the app accepts it. No automated test covers this yet; it was confirmed via manual/live testing only.

### Issue #5 — Password minimum-length error message doesn't match the actual requirement

Submitting a 7-character password shows the error:

> "Password must be minimal 6 characters long."

But the app doesn't actually accept a 6- or 7-character password — the requirement bullet UI (and the real submit validation) both enforce an 8-character minimum. The error message text is wrong; it should read "8 characters," not "6 characters."

### Open question — Email max-length is ambiguous

The AC claims a 256-character max for email. The underlying database schema (per the open-source repo's architecture docs) defines the column as `varchar(60)`. Neither was directly confirmed as the enforced limit: a test email with a 96-character local part triggers "Email format is invalid," which is consistent with RFC 5321's 64-character local-part limit rather than either app-specific number. Treated as an equivalence-partitioning case (valid format vs. invalid format) rather than a boundary-value case, since the app doesn't expose a clean numeric boundary to test against.

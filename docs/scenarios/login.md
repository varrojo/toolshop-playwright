# Login — Scenario Plan

Status: ⚪ Not started — planning only, scenarios not yet implemented.

Source: site's Testing Guide, feature #2 (Login).

**Acceptance Criteria**

- User can log in with valid credentials.
- Login fails with incorrect password, unknown email, or disabled/locked account.
- Error messages are clear and specific.

**Techniques applied:** Equivalence Partitioning (valid vs. invalid credentials), State Transition Testing (logged out → logged in → logged out), Error Guessing (case sensitivity, whitespace, SQL injection attempt).

## Test account strategy

This suite runs `fullyParallel: true` across 3 browser projects, and the app has a real account-lockout feature (see Notes below) — a shared hardcoded account will eventually get locked out just from normal negative testing running concurrently. Plan:

- **Reuse one dedicated test user** (created once via the Register flow, e.g. in a setup step) for anything that doesn't tick a failed-attempt counter: valid login, logout, case-insensitive email, missing-field, malformed-email, and SQL-injection-string scenarios (none of these hit a real account with a wrong password).
- **Use a fresh, disposable user per test** for any scenario that pairs a _valid_ email with a _wrong_ password (wrong password, password case-sensitivity, password whitespace) — these are exactly the ones that increment the lockout counter, and running them in parallel against one shared account risks tripping lockout as a side effect.
- **Use a separate one-off disposable user** for the intentional lockout scenario itself (#13) — never the "main" reusable login test user, and never the site's shared demo accounts (see Notes).

## Scenarios

| #   | Scenario                                                         | Expected result                                                                                                      | Status         |
| --- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | Valid credentials                                                | Redirect to `/account`                                                                                               | ⚪ Not started |
| 2   | Incorrect password, valid email                                  | "Invalid email or password"                                                                                          | ⚪ Not started |
| 3   | Unknown/unregistered email                                       | "Invalid email or password" (same generic message as #2 — see Notes)                                                 | ⚪ Not started |
| 4   | Email missing                                                    | "Email is required"                                                                                                  | ⚪ Not started |
| 5   | Password missing                                                 | "Password is required"                                                                                               | ⚪ Not started |
| 6   | Both fields missing                                              | Both "Email is required" and "Password is required" shown at once (confirmed)                                        | ⚪ Not started |
| 7   | Malformed email format                                           | "Email format is invalid"                                                                                            | ⚪ Not started |
| 8   | SQL-injection string in email field                              | "Email format is invalid" (client-side format check blocks it before submit)                                         | ⚪ Not started |
| 9   | Password, uppercase variant of correct password                  | "Invalid email or password" (password is case-sensitive)                                                             | ⚪ Not started |
| 10  | Password with leading/trailing spaces                            | "Invalid email or password" (not trimmed)                                                                            | ⚪ Not started |
| 11  | Email, fully uppercase valid address                             | Redirect to `/account` (email match is case-insensitive)                                                             | ⚪ Not started |
| 12  | Email with leading/trailing spaces                               | Not yet cleanly verified — probe was contaminated by the lockout in #13's incident, needs a clean re-check           | ⚪ Not started |
| 13  | Disabled/locked account                                          | "Account locked, too many failed attempts. Please contact the administrator." — use a disposable account (see above) | ⚪ Not started |
| 14  | State transition: logged out → logged in → Sign out → logged out | User dropdown (top-right, shows account name) → Sign out → returns to logged-out state                               | ⚪ Not started |

## Notes (confirmed via manual live probing, not yet automated)

- **Wrong password and unknown email return the identical generic message** ("Invalid email or password") — the app doesn't distinguish which part was wrong. This may be intentional (avoids user enumeration) but is worth flagging against the AC's "clear and specific" wording rather than assuming it's a bug.
- **The documented shared demo account got locked out during this session's probing.** `customer@practicesoftwaretesting.com` / `welcome01` (from the practice-software-testing repo's README) now returns the lockout message even with the correct password. The repo also documents `customer2@practicesoftwaretesting.com` / `welcome01` and `customer3@practicesoftwaretesting.com` / `pass123` as alternates — avoid all three for anything beyond a single one-off valid-login sanity check; prefer a self-registered account for real test scenarios.
- Logout control confirmed live: top-right dropdown showing the logged-in user's name → **Sign out**.

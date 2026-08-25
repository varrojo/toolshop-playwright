# Register — Scenario Plan

[← Back to README](../../README.md#scenarios-covered-per-module)

Status: 🟢 Done — 32 of 32 scenarios done.

Source: site's Testing Guide, feature #1 (Register).

**Acceptance Criteria**

- Age must be between 18 and 75 inclusive.
- Email must be unique and in valid format.
- All mandatory fields (first name, last name, email, password, confirm password) must be filled.
- Name/address/phone fields respect max lengths and validation rules.
- Password must be at least 8 characters, contain upper, lower, digit, and symbol, not be compromised, and match confirm password.

**Techniques applied:** Boundary Value Analysis (age and password length), Equivalence Partitioning (valid/invalid email, password character rules, mandatory fields filled/missing), Decision Table (combinations of missing fields), Error Guessing (SQL injection, emoji, spaces in fields).

## Scenarios

| #   | Scenario                               | Expected result                                                                                                                                                  | Status  |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | dob → age 17                           | "Customer must be 18 years old."                                                                                                                                 | ✅ Done |
| 2   | dob → age 18 exactly                   | Redirect to `/auth/login` — **see Issue #1**, real behavior requires 18 years + 1 day                                                                            | ✅ Done |
| 3   | dob → age 75                           | Redirect to `/auth/login`                                                                                                                                        | ✅ Done |
| 4   | dob → age 93                           | "Customer must be younger than 75 years old." — **see Issue #2**, real ceiling is 92, not the documented 75/76                                                   | ✅ Done |
| 5   | First name missing                     | "First name is required"                                                                                                                                         | ✅ Done |
| 6   | Last name missing                      | "Last name is required"                                                                                                                                          | ✅ Done |
| 7   | Email missing                          | "Email is required"                                                                                                                                              | ✅ Done |
| 8   | Password missing                       | "Password is required"                                                                                                                                           | ✅ Done |
| 9   | Password, 7 characters                 | All requirement bullets stay unfulfilled (real-time UI state) — **see Issue #5**, submit error text claims a 6-character minimum but the app actually enforces 8 | ✅ Done |
| 10  | Password, meets all requirements       | All requirement bullets turn green                                                                                                                               | ✅ Done |
| 11  | Known-breached password                | "The given password has appeared in a data leak. Please choose a different password."                                                                            | ✅ Done |
| 12  | First name, 41 characters              | "The first name field must not be greater than 40 characters."                                                                                                   | ✅ Done |
| 13  | Last name, 21 characters               | "The last name field must not be greater than 20 characters."                                                                                                    | ✅ Done |
| 14  | Street, 71 characters                  | "The address.street field must not be greater than 70 characters."                                                                                               | ✅ Done |
| 15  | City, 41 characters                    | "The address.city field must not be greater than 40 characters."                                                                                                 | ✅ Done |
| 16  | State, 41 characters                   | "The address.state field must not be greater than 40 characters." — real-time UI message renders slower in webkit, needs a scoped `{ timeout: 10000 }` override  | ✅ Done |
| 17  | Postal code, 11 characters             | "The address.postal code field must not be greater than 10 characters."                                                                                          | ✅ Done |
| 18  | Phone, 25 characters                   | "The phone field must not be greater than 24 characters."                                                                                                        | ✅ Done |
| 19  | Phone contains `+`                     | "Only numbers are allowed."                                                                                                                                      | ✅ Done |
| 20  | Email malformed / oversized local-part | "Email format is invalid" — **see Issue #4**, a missing-TLD email (`qatest123@gmail`) does NOT trigger this                                                      | ✅ Done |
| 21  | Email already registered               | "A customer with this email address already exists." — **see Issue #3**, differs from the AC's documented text                                                   | ✅ Done |
| 22  | All fields valid                       | Redirect to `/auth/login`                                                                                                                                        | ✅ Done |
| 23  | Date of Birth missing                  | "Date of Birth is required"                                                                                                                                      | ✅ Done |
| 24  | Date of Birth, invalid format          | "Please enter a valid date in YYYY-MM-DD format."                                                                                                                | ✅ Done |
| 25  | Country missing                        | "Country is required"                                                                                                                                            | ✅ Done |
| 26  | Postcode missing                       | "Postcode is required"                                                                                                                                           | ✅ Done |
| 27  | House number missing                   | "House number is required"                                                                                                                                       | ✅ Done |
| 28  | Street missing                         | "Street is required"                                                                                                                                             | ✅ Done |
| 29  | City missing                           | "City is required"                                                                                                                                               | ✅ Done |
| 30  | State missing                          | "State is required"                                                                                                                                              | ✅ Done |
| 31  | Phone missing                          | "Phone is required."                                                                                                                                             | ✅ Done |
| 32  | Phone contains letters                 | "Only numbers are allowed." — bonus error-guessing case beyond the original plan                                                                                 | ✅ Done |

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

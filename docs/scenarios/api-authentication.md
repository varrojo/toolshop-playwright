# API Testing — Authentication — Scenario Plan

[← Back to README](../../README.md#api-testing-coverage)

Status: 📝 Planned — 0 of 14 scenarios done.

Source: site's public OpenAPI spec (Swagger UI at `https://api.practicesoftwaretesting.com/api/documentation`, raw spec at `/docs?api-docs.json`), `User` tag — `/users/login`, `/users/register`, `/users/logout`, `/users/refresh`, `/users/forgot-password`, `/users/me`.

**Acceptance Criteria**

- Valid credentials return a usable Bearer token; invalid credentials are rejected.
- Registering a new account persists the submitted data and returns it back correctly.
- Protected endpoints (`/users/me`, `/users/logout`, `/users/refresh`) reject requests with no token or an invalid one.
- Logging out actually invalidates the token server-side, not just client-side.
- Forgot-password resets the account to a known password rather than silently no-op'ing.

**Techniques applied:** Equivalence Partitioning (valid vs. invalid credentials, valid vs. invalid/missing tokens), Boundary Value Analysis (password `minLength: 8`), State Transition Testing (unauthenticated → authenticated → logged out → token invalidated), Error Guessing (duplicate email on register, missing required fields, forgot-password against an unregistered email).

## Auth mechanism

Bearer JWT (`securitySchemes.apiAuth`, `scheme: bearer`, `bearerFormat: JWT`). `POST /users/login` and `POST /users/register` return a `TokenResponse` (`access_token`, `token_type`, `expires_in`); pass `Authorization: Bearer <access_token>` on subsequent authenticated requests via `request.newContext({ extraHTTPHeaders: { Authorization: ... } })` or per-call headers.

## Scenarios

| # | Scenario | Expected result | Status |
| - | - | - | - |
| 1 | `POST /users/login` with valid credentials | `200`, body has `access_token`, `token_type: "Bearer"`, `expires_in` | 📝 To Do |
| 2 | `POST /users/login` with wrong password | Spec only documents `200` — needs live confirmation of the actual error status/body (likely `401`, see Notes) | 📝 To Do |
| 3 | `POST /users/login` with unregistered email | Confirm whether response matches #2 (generic message, avoids user enumeration) or differs | 📝 To Do |
| 4 | `POST /users/register` with valid new-user data | `201`, `UserResponse` body reflects submitted `first_name`/`last_name`/`email`/etc., `id` present | 📝 To Do |
| 5 | `POST /users/register` with an email already in use | `409`, `DuplicateConflictResponse` body | 📝 To Do |
| 6 | `POST /users/register` with a required field missing (e.g. `password`) | `400` | 📝 To Do |
| 7 | `POST /users/register` with password under 8 characters | `400` (boundary on `minLength: 8`) | 📝 To Do |
| 8 | `GET /users/me` with no `Authorization` header | `401`, `UnauthorizedResponse` body | 📝 To Do |
| 9 | `GET /users/me` with a valid token | `200`, `UserResponse` body matches the logged-in account | 📝 To Do |
| 10 | `GET /users/refresh` with a valid token | `200`, new `TokenResponse` issued | 📝 To Do |
| 11 | `GET /users/refresh` with no/invalid token | `401` | 📝 To Do |
| 12 | `GET /users/logout` with a valid token | `200`, `{ message: "Successfully logged out" }` | 📝 To Do |
| 13 | Re-use a token on `/users/me` after that same token logged out | `401` — proves logout invalidates the token server-side, not just a client-side discard (State Transition Testing) | 📝 To Do |
| 14 | `POST /users/forgot-password` for a registered email | `200`, `{ success: true }`, and the account's password is actually changed to `welcome02` (see Notes) — verify by then logging in with `welcome02` | 📝 To Do |

## Notes

- **Login's documented responses only list `200`** — the OpenAPI spec has no `401`/`400` entries for `/users/login`, unlike every other endpoint here which documents its error responses explicitly. Scenarios #2 and #3 need to establish the real behavior live before assuming a status code; don't trust the spec's silence here as "it always succeeds."
- **`/users/forgot-password`'s own spec description says it "actually sets the password to `welcome02`"** — this is a deterministic, testable side effect, not just a 200 response to check. Scenario #14 should verify the new password actually works, not just that the endpoint returned success. Use a disposable/self-registered account for this (mirrors the login module's test-account strategy) — never a shared seeded account, since this destructively changes its password for anyone else using it.
- Register's full request schema (`UserRequest`) includes optional `address`, `phone`, `dob` (must be 18–75 years old) fields beyond the required `first_name`/`last_name`/`email`/`password` — worth a couple of equivalence-partition scenarios later (with vs. without optional fields) if this module is extended past the initial pass.
- This module deliberately covers only the `User`/auth endpoints as a focused first pass — the full spec has 57 documented paths across products, carts, invoices, messages, reports, etc. Expand into those as separate scenario docs rather than growing this one, same one-file-per-module convention as the UI scenarios.
